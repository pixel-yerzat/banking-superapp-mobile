import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSendMessageMutation, useGetChatHistoryQuery } from '../../api';
import { colors, spacing, typography, borderRadius } from '../../theme/colors';

const ChatScreen = ({ navigation }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const flatListRef = useRef(null);

  const { data: historyData, refetch } = useGetChatHistoryQuery({ limit: 50 });
  const [sendMessage, { isLoading: isSending }] = useSendMessageMutation();

  const messages = historyData?.data || [];

  // Mock quick replies
  const quickReplies = [
    'Как заблокировать карту?',
    'Как оформить кредит?',
    'Проблема с переводом',
    'Лимиты по карте',
  ];

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!message.trim()) return;

    const userMessage = message.trim();
    setMessage('');
    setIsTyping(true);

    try {
      await sendMessage(userMessage).unwrap();
      refetch();
    } catch (error) {
      console.error('Send message error:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = (reply) => {
    setMessage(reply);
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';

    return (
      <View style={[styles.messageContainer, isUser && styles.userMessageContainer]}>
        <View style={[styles.messageBubble, isUser ? styles.userBubble : styles.botBubble]}>
          <Text style={[styles.messageText, isUser && styles.userMessageText]}>
            {item.message || item.content}
          </Text>
          <Text style={[styles.messageTime, isUser && styles.userMessageTime]}>
            {formatTime(item.created_at || item.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  const renderTypingIndicator = () => (
    <View style={styles.messageContainer}>
      <View style={[styles.messageBubble, styles.botBubble, styles.typingBubble]}>
        <View style={styles.typingDots}>
          <View style={[styles.typingDot, styles.typingDot1]} />
          <View style={[styles.typingDot, styles.typingDot2]} />
          <View style={[styles.typingDot, styles.typingDot3]} />
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Помощник</Text>
          <Text style={styles.headerSubtitle}>Онлайн</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('FAQ')}>
          <Ionicons name="help-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        {/* Messages List */}
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item, index) => item.id || `msg-${index}`}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            messages.length === 0 ? (
              <View style={styles.welcomeContainer}>
                <View style={styles.botAvatar}>
                  <Ionicons name="chatbubble-ellipses" size={32} color={colors.primary} />
                </View>
                <Text style={styles.welcomeTitle}>Здравствуйте! 👋</Text>
                <Text style={styles.welcomeText}>
                  Я виртуальный помощник банка. Чем могу помочь?
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={isTyping ? renderTypingIndicator : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        {/* Quick Replies */}
        {messages.length === 0 && (
          <View style={styles.quickRepliesContainer}>
            {quickReplies.map((reply, index) => (
              <TouchableOpacity
                key={index}
                style={styles.quickReply}
                onPress={() => handleQuickReply(reply)}
              >
                <Text style={styles.quickReplyText}>{reply}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Написать сообщение..."
              placeholderTextColor={colors.gray400}
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
              onPress={handleSend}
              disabled={!message.trim() || isSending}
            >
              <Ionicons
                name="send"
                size={20}
                color={message.trim() ? colors.white : colors.gray400}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backButton: { padding: spacing.xs },
  headerInfo: { flex: 1, marginLeft: spacing.md },
  headerTitle: { ...typography.h4, color: colors.textPrimary },
  headerSubtitle: { ...typography.caption, color: colors.success },
  keyboardView: { flex: 1 },
  messagesList: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  welcomeContainer: { alignItems: 'center', paddingVertical: spacing.xl },
  botAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: `${colors.primary}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  welcomeTitle: { ...typography.h3, color: colors.textPrimary, marginBottom: spacing.xs },
  welcomeText: { ...typography.body2, color: colors.textSecondary, textAlign: 'center' },
  messageContainer: { marginBottom: spacing.sm },
  userMessageContainer: { alignItems: 'flex-end' },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: borderRadius.xs,
  },
  botBubble: {
    backgroundColor: colors.white,
    borderBottomLeftRadius: borderRadius.xs,
  },
  messageText: { ...typography.body2, color: colors.textPrimary },
  userMessageText: { color: colors.white },
  messageTime: { ...typography.caption, color: colors.textTertiary, marginTop: spacing.xs, alignSelf: 'flex-end' },
  userMessageTime: { color: 'rgba(255,255,255,0.7)' },
  typingBubble: { paddingVertical: spacing.md },
  typingDots: { flexDirection: 'row', gap: 4 },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.gray400,
  },
  typingDot1: { opacity: 0.4 },
  typingDot2: { opacity: 0.6 },
  typingDot3: { opacity: 0.8 },
  quickRepliesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.sm,
  },
  quickReply: {
    backgroundColor: colors.white,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  quickReplyText: { ...typography.body2, color: colors.primary },
  inputContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.gray50,
    borderRadius: borderRadius.lg,
    paddingLeft: spacing.md,
    paddingRight: spacing.xs,
    paddingVertical: spacing.xs,
  },
  input: {
    flex: 1,
    ...typography.body1,
    color: colors.textPrimary,
    maxHeight: 100,
    paddingVertical: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: { backgroundColor: colors.gray200 },
});

export default ChatScreen;
