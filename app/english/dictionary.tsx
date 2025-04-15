import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { supabase } from '@/supabase/config';

interface DictionaryWord {
  id: string;
  word: string;
  phonetic?: string;
  meanings: any[];
}

export default function DictionaryScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [words, setWords] = useState<DictionaryWord[]>([]);
  const [filteredWords, setFilteredWords] = useState<DictionaryWord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchWords();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredWords(words);
    } else {
      const filtered = words.filter(word => 
        word.word.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredWords(filtered);
    }
  }, [searchQuery, words]);

  const fetchWords = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('english_words')
        .select('*')
        .order('word', { ascending: true })
        .limit(100);
      
      if (error) throw error;
      
      setWords(data || []);
      setFilteredWords(data || []);
    } catch (err: any) {
      console.error('Error fetching words:', err);
      setError(err.message || 'Failed to fetch words');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordPress = (word: string) => {
    router.push(`/english/word/${encodeURIComponent(word)}`);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const renderItem = ({ item }: { item: DictionaryWord }) => (
    <TouchableOpacity
      style={[styles.wordItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={() => handleWordPress(item.word)}
    >
      <View>
        <Text style={[styles.wordText, { color: colors.text }]}>{item.word}</Text>
        {item.phonetic && (
          <Text style={[styles.phoneticText, { color: colors.textSecondary }]}>
            {item.phonetic}
          </Text>
        )}
        {item.meanings && item.meanings.length > 0 && (
          <Text
            style={[styles.definitionText, { color: colors.textSecondary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {item.meanings[0].definition}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>İngilizce Sözlük</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search size={20} color={colors.textSecondary} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Kelime ara..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
        </View>
      ) : filteredWords.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            {searchQuery.trim() ? `"${searchQuery}" ile eşleşen kelime bulunamadı` : 'Kelime bulunamadı'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredWords}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    marginLeft: 8,
  },
  clearButton: {
    padding: 8,
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  wordItem: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  wordText: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  phoneticText: {
    fontSize: 14,
    marginBottom: 4,
  },
  definitionText: {
    fontSize: 14,
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
  },
});
