import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useEnglishLearningStore } from '@/store/englishLearningStore';
import { ArrowLeft, Star, ChevronRight } from 'lucide-react-native';

export default function LearnedWordsScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    learnedWords,
    isLoading,
    error,
    fetchLearnedWords,
  } = useEnglishLearningStore();

  useEffect(() => {
    fetchLearnedWords();
  }, []);

  const handleWordPress = (word: string) => {
    router.push(`/english/word/${encodeURIComponent(word)}`);
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[styles.wordItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleWordPress(item.english_words.word)}
    >
      <View style={styles.wordInfo}>
        <Text style={[styles.wordText, { color: colors.text }]}>
          {item.english_words.word}
        </Text>
        
        {item.english_words.meanings && item.english_words.meanings.length > 0 && (
          <Text
            style={[styles.definitionText, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.english_words.meanings[0].definition}
          </Text>
        )}
        
        <View style={styles.confidenceContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              size={14}
              color={star <= Math.ceil(item.confidence / 20) ? colors.primary : colors.border}
              fill={star <= Math.ceil(item.confidence / 20) ? colors.primary : 'transparent'}
            />
          ))}
        </View>
      </View>
      
      <ChevronRight size={18} color={colors.textSecondary} />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Öğrenilen Kelimeler</Text>
        <View style={styles.placeholder} />
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : learnedWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Henüz kelime öğrenmediniz
          </Text>
        </View>
      ) : (
        <FlatList
          data={learnedWords}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  placeholder: {
    width: 32,
  },
  listContent: {
    padding: 16,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  wordInfo: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
    marginBottom: 8,
  },
  confidenceContainer: {
    flexDirection: 'row',
  },
  separator: {
    height: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
