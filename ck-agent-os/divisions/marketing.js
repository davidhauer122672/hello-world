/**
 * @file marketing.js
 * @division MKT — Marketing
 * @description Division controller for Marketing. Manages content creation, video production,
 * podcast production, SEO, and social media workflows.
 * Integrates with Airtable (Content Calendar, Video Production, Podcast Production tables)
 * and social media platforms.
 *
 * Agents: Amplify, Scribe, Director, Broadcaster, Signal, Impression (6 total)
 */

/** Task types handled by the Marketing division. */
export const MKT_TASK_TYPES = {
  CONTENT_CREATE:         'mkt.content_create',
  CONTENT_PUBLISH:        'mkt.content_publish',
  VIDEO_PRODUCTION:       'mkt.video_production',
  PODCAST_PRODUCTION:     'mkt.podcast_production',
  SEO_OPTIMIZE:           'mkt.seo_optimize',
  SOCIAL_MEDIA_POST:      'mkt.social_media_post',
  CONTENT_PIPELINE_RUN:   'mkt.content_pipeline_run',
  VIDEO_WORKFLOW:         'mkt.video_workflow',
  PODCAST_EPISODE:        'mkt.podcast_episode',
  CAMPAIGN_LAUNCH:        'mkt.campaign_launch',
  ANALYTICS_REPORT:       'mkt.analytics_report',
};

/** Airtable table identifiers used by the Marketing division. */
const AIRTABLE_TABLES = {
  CONTENT_CALENDAR: 'Content Calendar',
  VIDEO_PRODUCTION: 'Video Production',
  PODCAST:          'Podcast Production',
};

/** Ordered list of agents within the Marketing division. */
const AGENTS = ['Amplify', 'Scribe', 'Director', 'Broadcaster', 'Signal', 'Impression'];

export class MarketingController {
  /**
   * @param {object} env          - Cloudflare Worker environment bindings.
   * @param {object} orchestrator - Master Orchestrator instance.
   */
  constructor(env, orchestrator) {
    this.env          = env;
    this.orchestrator = orchestrator;
    this.divisionCode = 'MKT';
    this.divisionName = 'Marketing';
    this.agents       = Object.fromEntries(AGENTS.map(name => [name, { name, status: 'idle', tasksCompleted: 0 }]));
    this.taskLog      = [];
    this.startedAt    = Date.now();

    /** Running count of published pieces per channel. */
    this.publishCounts = { blog: 0, video: 0, podcast: 0, social: 0 };
  }

  /**
   * Route an incoming task to the appropriate Marketing agent.
   *
   * @param {object} task         - Task descriptor.
   * @param {string} task.type    - One of MKT_TASK_TYPES.
   * @param {object} task.payload - Task-specific data.
   * @returns {Promise<object>} Result from the handling agent.
   */
  async handleTask(task) {
    const { type, payload } = task;

    switch (type) {
      case MKT_TASK_TYPES.CONTENT_CREATE:
        return this._dispatch('Scribe', task);

      case MKT_TASK_TYPES.CONTENT_PUBLISH:
        return this._publishContent(payload);

      case MKT_TASK_TYPES.VIDEO_PRODUCTION:
        return this._dispatch('Director', task);

      case MKT_TASK_TYPES.PODCAST_PRODUCTION:
        return this._dispatch('Broadcaster', task);

      case MKT_TASK_TYPES.SEO_OPTIMIZE:
        return this._dispatch('Signal', task);

      case MKT_TASK_TYPES.SOCIAL_MEDIA_POST:
        return this._postToSocial(payload);

      case MKT_TASK_TYPES.CONTENT_PIPELINE_RUN:
        return this._runContentPipeline(payload);

      case MKT_TASK_TYPES.VIDEO_WORKFLOW:
        return this._runVideoWorkflow(payload);

      case MKT_TASK_TYPES.PODCAST_EPISODE:
        return this._runPodcastEpisodeWorkflow(payload);

      case MKT_TASK_TYPES.CAMPAIGN_LAUNCH:
        return this._dispatch('Amplify', task);

      case MKT_TASK_TYPES.ANALYTICS_REPORT:
        return this._dispatch('Impression', task);

      default:
        return { success: false, error: `Unknown MKT task type: ${type}` };
    }
  }

  /**
   * Execute the full content pipeline: create → SEO-optimise → schedule in Airtable.
   * Scribe drafts the piece, Signal optimises it, Amplify schedules the publication.
   * @param {object} payload - Content brief, topic, target channel, publish date.
   * @returns {Promise<object>} Pipeline result.
   */
  async _runContentPipeline(payload) {
    const draft    = await this._dispatch('Scribe',  { type: MKT_TASK_TYPES.CONTENT_CREATE,  payload });
    const seo      = await this._dispatch('Signal',  { type: MKT_TASK_TYPES.SEO_OPTIMIZE,    payload: { ...payload, draft } });
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.CONTENT_CALENDAR, {
      title:     payload.title,
      channel:   payload.channel,
      publishAt: payload.publishDate,
      status:    'Scheduled',
    });
    const scheduled = await this._dispatch('Amplify', { type: MKT_TASK_TYPES.CONTENT_PUBLISH, payload: { ...payload, seo } });
    return { workflow: 'content_pipeline', success: true, draft, seo, scheduled };
  }

  /**
   * Execute the full video production workflow: script → production → publish.
   * Scribe writes the script, Director produces, Amplify distributes.
   * @param {object} payload - Video brief, format, target platform.
   * @returns {Promise<object>} Video workflow result.
   */
  async _runVideoWorkflow(payload) {
    const script   = await this._dispatch('Scribe',   { type: MKT_TASK_TYPES.CONTENT_CREATE,   payload });
    const produced = await this._dispatch('Director', { type: MKT_TASK_TYPES.VIDEO_PRODUCTION, payload: { ...payload, script } });
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.VIDEO_PRODUCTION, {
      title:  payload.title,
      format: payload.format,
      status: 'In Production',
    });
    const published = await this._publishContent({ ...payload, type: 'video', produced });
    return { workflow: 'video_workflow', success: true, script, produced, published };
  }

  /**
   * Execute the full podcast episode workflow: outline → recording notes → publish.
   * Scribe writes the episode outline, Broadcaster produces, Amplify publishes.
   * @param {object} payload - Episode title, guest, release date.
   * @returns {Promise<object>} Podcast episode workflow result.
   */
  async _runPodcastEpisodeWorkflow(payload) {
    const outline   = await this._dispatch('Scribe',       { type: MKT_TASK_TYPES.CONTENT_CREATE,     payload });
    const produced  = await this._dispatch('Broadcaster',  { type: MKT_TASK_TYPES.PODCAST_PRODUCTION, payload: { ...payload, outline } });
    await this.env.AIRTABLE_SERVICE?.createRecord(AIRTABLE_TABLES.PODCAST, {
      episode:   payload.episodeNumber,
      title:     payload.title,
      releaseAt: payload.releaseDate,
      status:    'Recorded',
    });
    const published = await this._publishContent({ ...payload, type: 'podcast', produced });
    return { workflow: 'podcast_episode', success: true, outline, produced, published };
  }

  /**
   * Publish a content piece and increment the appropriate channel counter.
   * @param {object} payload - Content item with channel/type and body.
   * @returns {Promise<object>} Publish result.
   */
  async _publishContent(payload) {
    const channel = payload.type ?? payload.channel ?? 'blog';
    this.publishCounts[channel] = (this.publishCounts[channel] ?? 0) + 1;
    return this._dispatch('Amplify', { type: MKT_TASK_TYPES.CONTENT_PUBLISH, payload });
  }

  /**
   * Post content to one or more social media platforms via the social service.
   * @param {object} payload - Post body, platforms array, scheduled time.
   * @returns {Promise<object>} Social post result.
   */
  async _postToSocial(payload) {
    const { platforms = [], body, scheduledAt } = payload;
    const result = await this.env.SOCIAL_SERVICE?.post({ platforms, body, scheduledAt });
    this.publishCounts.social += platforms.length;
    return this._dispatch('Signal', {
      type:    MKT_TASK_TYPES.SOCIAL_MEDIA_POST,
      payload: { ...payload, socialResult: result },
    });
  }

  /**
   * Internal task dispatch to a named agent.
   * @param {string} agentName - Target agent.
   * @param {object} task      - Task descriptor.
   * @returns {Promise<object>} Agent result.
   */
  async _dispatch(agentName, task) {
    const agent = this.agents[agentName];
    agent.status = 'busy';
    const result = await this.orchestrator.runAgent(this.divisionCode, agentName, task);
    agent.status = 'idle';
    agent.tasksCompleted += 1;
    this.taskLog.push({ agentName, type: task.type, ts: Date.now(), success: result?.success ?? true });
    return result;
  }

  /**
   * Return current health and per-agent status for the Marketing division.
   * @returns {object} Division status snapshot.
   */
  getStatus() {
    return {
      division:      this.divisionCode,
      name:          this.divisionName,
      healthy:       true,
      uptimeMs:      Date.now() - this.startedAt,
      agents:        Object.values(this.agents),
      taskCount:     this.taskLog.length,
      publishCounts: { ...this.publishCounts },
    };
  }

  /**
   * Return Marketing-specific KPIs (content pieces, videos, podcasts, social posts, campaigns).
   * @returns {object} Division metrics.
   */
  getDivisionMetrics() {
    const completed = this.taskLog.filter(t => t.success).length;

    return {
      division:            this.divisionCode,
      totalTasksProcessed: this.taskLog.length,
      successRate:         this.taskLog.length ? (completed / this.taskLog.length) : 1,
      contentPiecesCreated:this.taskLog.filter(t => t.type === MKT_TASK_TYPES.CONTENT_CREATE).length,
      videosProduced:      this.taskLog.filter(t => t.type === MKT_TASK_TYPES.VIDEO_PRODUCTION).length,
      podcastsProduced:    this.taskLog.filter(t => t.type === MKT_TASK_TYPES.PODCAST_PRODUCTION).length,
      socialPostsPublished:this.publishCounts.social,
      campaignsLaunched:   this.taskLog.filter(t => t.type === MKT_TASK_TYPES.CAMPAIGN_LAUNCH).length,
      publishCounts:       { ...this.publishCounts },
      agentUtilization:    Object.fromEntries(
        Object.values(this.agents).map(a => [a.name, a.tasksCompleted])
      ),
    };
  }
}

export default MarketingController;
