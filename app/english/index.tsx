import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useEnglishLearningStore } from '@/store/englishLearningStore';
import { Search, Book, RefreshCw, ChevronRight, Star, MapPin } from 'lucide-react-native';
import Button from '@/components/Button';

export default function EnglishLearningScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const {
    learnedWords,
    suggestedWords,
    isLoading,
    error,
    fetchLearnedWords,
    fetchSuggestedWords,
  } = useEnglishLearningStore();

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchLearnedWords();
    fetchSuggestedWords(5);
  }, []);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/english/word/${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleWordPress = (word: string) => {
    router.push(`/english/word/${encodeURIComponent(word)}`);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>İngilizce Öğren</Text>
        </View>

        <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Kelime ara..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={handleSearch}
          />
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Search size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Önerilen Kelimeler</Text>
            <TouchableOpacity onPress={() => fetchSuggestedWords(5)}>
              <RefreshCw size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : suggestedWords.length > 0 ? (
            <View style={styles.wordList}>
              {suggestedWords.map((word) => (
                <TouchableOpacity
                  key={word.id}
                  style={[styles.wordItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleWordPress(word.word)}
                >
                  <Text style={[styles.wordText, { color: colors.text }]}>{word.word}</Text>
                  <ChevronRight size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Önerilen kelime bulunamadı
            </Text>
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Son Öğrenilen Kelimeler</Text>
            <TouchableOpacity onPress={() => router.push('/english/learned')}>
              <Text style={[styles.seeAllText, { color: colors.primary }]}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {isLoading ? (
            <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
          ) : learnedWords.length > 0 ? (
            <View style={styles.wordList}>
              {learnedWords.slice(0, 5).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.wordItem, { backgroundColor: colors.card, borderColor: colors.border }]}
                  onPress={() => handleWordPress(item.english_words.word)}
                >
                  <View style={styles.wordItemContent}>
                    <Text style={[styles.wordText, { color: colors.text }]}>
                      {item.english_words.word}
                    </Text>
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
              ))}
            </View>
          ) : (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              Henüz kelime öğrenmediniz
            </Text>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <Button
            title="Kelime Tekrarı"
            onPress={() => router.push('/english/review')}
            leftIcon={<RefreshCw size={18} color="#FFFFFF" />}
            style={styles.button}
          />
          <Button
            title="Kelime Listesi"
            onPress={() => router.push('/english/dictionary')}
            leftIcon={<Book size={18} color="#FFFFFF" />}
            style={styles.button}
          />
        </View>

        <View style={[styles.locationSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.locationHeader}>
            <MapPin size={24} color={colors.primary} />
            <Text style={[styles.locationTitle, { color: colors.text }]}>Konuma Göre Öğren</Text>
          </View>
          <Text style={[styles.locationDescription, { color: colors.textSecondary }]}>
            Bulunduğunuz yerdeki mekanların İngilizce karşılıklarını öğrenin.
          </Text>
          <Button
            title="Konuma Göre Öğren"
            onPress={() => router.push('/english/location')}
            leftIcon={<MapPin size={18} color="#FFFFFF" />}
            style={styles.locationButton}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 24,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
  },
  searchButton: {
    padding: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  wordList: {
    gap: 8,
  },
  wordItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  wordItemContent: {
    flex: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
  },
  confidenceContainer: {
    flexDirection: 'row',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    padding: 16,
    fontStyle: 'italic',
  },
  loader: {
    padding: 16,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  locationSection: {
    borderRadius: 8,
    borderWidth: 1,
    padding: 16,
    marginTop: 16,
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  locationDescription: {
    fontSize: 14,
    marginBottom: 16,
  },
  locationButton: {
    width: '100%',
  },
});
