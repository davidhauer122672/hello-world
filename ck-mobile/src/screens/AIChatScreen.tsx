/**
 * AI Chat Screen — Interface for the two embedded Claude AI agents:
 * 1. Sentinel (Sales Agent) — Lead qualification, sales conversations
 * 2. Architect (Client Builder) — Client onboarding, property setup
 *
 * Features real-time chat with typing indicators, auto-actions,
 * and onboarding progress tracking.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SPACING, FONT, RADIUS, SHADOWS } from '../styles/theme';
import { salesAgent } from '../agents/client-sales-agent';
import { clientBuildingAgent } from '../agents/client-building-agent';
import { useAppStore } from '../store/app-store';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

type AgentType = 'sales' | 'client';

export function AIChatScreen({ route, navigation }: { route: any; navigation: any }) {
  const agentType: AgentType = route?.params?.agentType || 'sales';
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeTab, setActiveTab] = useState<AgentType>(agentType);
  const flatListRef = useRef<FlatList>(null);

  const agent = activeTab === 'sales' ? salesAgent : clientBuildingAgent;
  const agentName = activeTab === 'sales' ? 'Sentinel' : 'Architect';
  const agentColor = activeTab === 'sales' ? COLORS.green : COLORS.accent;

  useEffect(() => {
    // Welcome message
    const welcome: ChatMessage = {
      id: 'welcome',
      role: 'assistant',
      content:
        activeTab === 'sales'
          ? "Hello! I'm Sentinel, your AI Sales Agent at Coastal Key Property Management. I specialize in the Treasure Coast luxury market — Port St. Lucie, Stuart, Jensen Beach, Jupiter, and beyond.\n\nHow can I help you today? Whether you're exploring property management services, need market insights, or want to discuss your property portfolio, I'm here to assist."
          : "Welcome! I'm Architect, your AI Client Building Agent. I'll guide you through setting up professional property management services with Coastal Key.\n\nLet's start with your property. Could you tell me the address and type of property you'd like us to manage?",
      timestamp: new Date(),
    };
    setMessages([welcome]);
  }, [activeTab]);

  const sendMessage = async () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputText.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const response = await agent.processMessage(userMsg.content);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMsg]);

      // Store in global state
      useAppStore.getState().addChatMessage({
        id: aiMsg.id,
        role: 'assistant',
        content: response,
        agentType: activeTab,
        timestamp: new Date().toISOString(),
      });
    } catch {
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'system',
        content: 'Connection interrupted. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const switchAgent = (type: AgentType) => {
    if (type === activeTab) return;
    setActiveTab(type);
    agent.reset();
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    const isSystem = item.role === 'system';

    return (
      <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.aiBubble, isSystem && styles.systemBubble]}>
        {!isUser && !isSystem && (
          <View style={styles.agentTag}>
            <View style={[styles.agentDot, { backgroundColor: agentColor }]} />
            <Text style={[styles.agentName, { color: agentColor }]}>{agentName}</Text>
          </View>
        )}
        <Text style={[styles.messageText, isUser && styles.userText]}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  // Onboarding progress (for Architect agent)
  const onboardingProgress = activeTab === 'client' ? clientBuildingAgent.getOnboardingProgress() : null;

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      {/* Agent Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sales' && styles.tabActive]}
          onPress={() => switchAgent('sales')}
        >
          <View style={[styles.tabDot, { backgroundColor: COLORS.green }]} />
          <Text style={[styles.tabText, activeTab === 'sales' && styles.tabTextActive]}>
            Sentinel Sales
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'client' && styles.tabActive]}
          onPress={() => switchAgent('client')}
        >
          <View style={[styles.tabDot, { backgroundColor: COLORS.accent }]} />
          <Text style={[styles.tabText, activeTab === 'client' && styles.tabTextActive]}>
            Architect Builder
          </Text>
        </TouchableOpacity>
      </View>

      {/* Onboarding Progress Bar (Architect only) */}
      {onboardingProgress && onboardingProgress.step > 0 && (
        <View style={styles.progressBar}>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${(onboardingProgress.step / onboardingProgress.total) * 100}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Onboarding Step {onboardingProgress.step}/{onboardingProgress.total}
          </Text>
        </View>
      )}

      {/* Messages */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        showsVerticalScrollIndicator={false}
      />

      {/* Typing Indicator */}
      {isTyping && (
        <View style={styles.typingRow}>
          <ActivityIndicator size="small" color={agentColor} />
          <Text style={styles.typingText}>{agentName} is thinking...</Text>
        </View>
      )}

      {/* Input Bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder={`Message ${agentName}...`}
          placeholderTextColor={COLORS.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={sendMessage}
          multiline
          maxLength={2000}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, { backgroundColor: inputText.trim() ? agentColor : COLORS.bgInput }]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isTyping}
        >
          <Text style={styles.sendIcon}>&#x27A4;</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingHorizontal: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.sm,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: COLORS.gold,
  },
  tabDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  tabText: {
    color: COLORS.textMuted,
    fontSize: FONT.sizes.md,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.textPrimary,
  },
  progressBar: {
    backgroundColor: COLORS.bgCard,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  progressTrack: {
    height: 4,
    backgroundColor: COLORS.bgInput,
    borderRadius: 2,
    marginBottom: SPACING.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.accent,
    borderRadius: 2,
  },
  progressText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.xs,
  },
  messageList: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xl,
  },
  messageBubble: {
    maxWidth: '85%',
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  userBubble: {
    backgroundColor: COLORS.gold + '20',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: COLORS.bgCard,
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  systemBubble: {
    backgroundColor: COLORS.redBg,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: COLORS.red + '30',
  },
  agentTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  agentDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  agentName: {
    fontSize: FONT.sizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  messageText: {
    color: COLORS.textPrimary,
    fontSize: FONT.sizes.md,
    lineHeight: 22,
  },
  userText: {
    color: COLORS.textPrimary,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontSize: 9,
    marginTop: SPACING.xs,
    alignSelf: 'flex-end',
  },
  typingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  typingText: {
    color: COLORS.textSecondary,
    fontSize: FONT.sizes.sm,
    fontStyle: 'italic',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: SPACING.md,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.bgInput,
    color: COLORS.textPrimary,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT.sizes.md,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendIcon: {
    color: '#fff',
    fontSize: 18,
  },
});
