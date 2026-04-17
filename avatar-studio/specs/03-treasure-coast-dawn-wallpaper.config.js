/**
 * Spec 3 — Treasure Coast Dawn Live Wallpaper
 *
 * Non-human hyper-real 3D live wallpaper. No people, no likeness.
 * Brand-aligned environmental motion loop for iPhone 16 Pro.
 */

'use strict';

module.exports = {
  id: 'ck-wallpaper-03-treasure-coast-dawn',
  title: 'Treasure Coast Dawn — Live Wallpaper',
  role: 'Brand-aligned iPhone 16 Pro live wallpaper for the Coastal Key CEO device.',
  version: '1.0.0',
  renderer: 'banana_pro_ai',
  targetPlatforms: ['iphone_16_pro_wallpaper'],

  subject: {
    name: 'Treasure Coast Dawn',
    kind: 'non_human',
    contentRating: 'G',
    description: [
      'Wide Treasure Coast shoreline at civil twilight into sunrise',
      'Foreground: damp sand with receding wash, scattered shell fragments',
      'Midground: glassy shorebreak with low foam lines',
      'Background: flat horizon with scattered low cumulus catching warm light',
      'No people, no boats, no structures',
    ],
  },

  environment: [
    'Sun rising 3-8 degrees above horizon, warm amber to soft gold gradient',
    'Sky gradient: deep indigo at top transitioning to warm gold at horizon',
    'Two to three silhouetted seabirds drifting across upper third of frame',
    'Palm frond edge visible in top-right corner, gently swaying',
    'Subtle volumetric haze over water',
  ],

  camera: {
    framing: 'wide environmental, horizon on lower third',
    angle: 'locked, eye-level with horizon',
    orientation: 'portrait 1179 x 2556',
    lens: 'equivalent 28mm full-frame, f/8, deep focus',
  },

  animation: {
    loopSeconds: 5,
    idleBehaviors: [
      'wave wash advances and recedes over 4-second cycle',
      'cloud drift at 2 degrees per second, left to right',
      'palm frond sway at 0.3 Hz',
      'seabird silhouettes complete one pass per loop',
      'sun position static (loop point fixed at dawn)',
    ],
  },

  technicalNotes: [
    'Water simulation: displacement map with SSS for thin-wash translucency',
    'Sky: physically based atmospheric model, Mie + Rayleigh scattering',
    'Color grade: Display P3, filmic curve, slight warm lift in shadows',
    'Seamless loop: ensure first-frame water displacement matches last-frame',
  ],

  deliveryProfile: {
    tone: 'environmental, calm, brand-aligned',
    cadence: 'slow, meditative motion; no startle cuts',
    prohibited: ['hard zooms', 'lens flares beyond subtle bloom', 'visible text or watermarks'],
  },
};
