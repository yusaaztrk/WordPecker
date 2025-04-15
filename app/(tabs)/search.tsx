import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import Input from '@/components/Input';
import { Search as SearchIcon, X, BookOpen, FileText } from 'lucide-react-native';
import { searchWords } from '@/firebase/words';
import { searchPublicWordLists } from '@/firebase/wordLists';
import { useAuthStore } from '@/store/authStore';

type SearchResult = {
  type: 'word' | 'list';
  id: string;
  title: string;
  subtitle: string;
  listId?: string;
  listName?: string;
};

export default function SearchScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchType, setSearchType] = useState<'all' | 'words' | 'lists'>('all');

  const handleSearch = async () => {
    if (!searchQuery.trim() || !user) return;
    
    setIsLoading(true);
    try {
      const combinedResults: SearchResult[] = [];
      
      // Search words if needed
      if (searchType === 'all' || searchType === 'words') {
        const wordResults = await searchWords(user.uid, searchQuery);
        
        wordResults.forEach(word => {
          combinedResults.push({
            type: 'word',
            id: word.id || '',
            title: word.term,
            subtitle: word.definition,
            listId: word.listId,
            listName: word.listName,
          });
        });
      }
      
      // Search lists if needed
      if (searchType === 'all' || searchType === 'lists') {
        const listResults = await searchPublicWordLists(searchQuery);
        
        listResults.forEach(list => {
          combinedResults.push({
            type: 'list',
            id: list.id || '',
            title: list.name,
            subtitle: `${list.language} → ${list.targetLanguage} • ${list.wordCount || 0} kelime`,
          });
        });
      }
      
      setResults(combinedResults);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setResults([]);
  };

  const handleResultPress = (result: SearchResult) => {
    if (result.type === 'word') {
      // Navigate to word edit screen
      router.push(`/word/edit/${result.id}`);
    } else {
      // Navigate to list details
      router.push(`/list/${result.id}`);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Arama</Text>
      </View>

      <View style={styles.searchContainer}>
        <Input
          placeholder="Kelime veya liste ara..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
          leftIcon={<SearchIcon size={20} color={colors.primary} />}
          rightIcon={
            searchQuery ? (
              <TouchableOpacity onPress={clearSearch}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            ) : null
          }
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            searchType === 'all' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setSearchType('all')}
        >
          <Text
            style={[
              styles.filterText,
              { color: searchType === 'all' ? colors.primary : colors.textSecondary }
            ]}
          >
            Tümü
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            searchType === 'words' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setSearchType('words')}
        >
          <Text
            style={[
              styles.filterText,
              { color: searchType === 'words' ? colors.primary : colors.textSecondary }
            ]}
          >
            Kelimeler
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            searchType === 'lists' && { backgroundColor: colors.primary + '20' }
          ]}
          onPress={() => setSearchType('lists')}
        >
          <Text
            style={[
              styles.filterText,
              { color: searchType === 'lists' ? colors.primary : colors.textSecondary }
            ]}
          >
            Listeler
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <>
          {results.length > 0 ? (
            <FlatList
              data={results}
              keyExtractor={(item) => `${item.type}-${item.id}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.resultItem, { backgroundColor: colors.card }]}
                  onPress={() => handleResultPress(item)}
                >
                  <View style={styles.resultIconContainer}>
                    {item.type === 'word' ? (
                      <FileText size={24} color={colors.primary} />
                    ) : (
                      <BookOpen size={24} color={colors.primary} />
                    )}
                  </View>
                  <View style={styles.resultContent}>
                    <Text style={[styles.resultTitle, { color: colors.text }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.resultSubtitle, { color: colors.textSecondary }]}>
                      {item.subtitle}
                    </Text>
                    {item.type === 'word' && item.listName && (
                      <Text style={[styles.resultListName, { color: colors.primary }]}>
                        Liste: {item.listName}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              )}
              contentContainerStyle={styles.resultsList}
            />
          ) : (
            searchQuery.length > 0 && (
              <View style={styles.emptyContainer}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  Sonuç bulunamadı
                </Text>
              </View>
            )
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
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
    marginBottom: 16,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 8,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  resultsList: {
    paddingBottom: 20,
  },
  resultItem: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultIconContainer: {
    marginRight: 16,
  },
  resultContent: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  resultSubtitle: {
    fontSize: 14,
    marginBottom: 4,
  },
  resultListName: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
  },
});