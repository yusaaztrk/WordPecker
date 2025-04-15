import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import { getWordsInList, deleteWord } from '@/firebase/wordLists';
import WordCard from '@/components/WordCard';
import EmptyState from '@/components/EmptyState';
import Button from '@/components/Button';
import {
  Plus,
  Edit,
  Trash2,
  BookOpen,
  Brain,
  PenTool,
  Languages,
  Clock,
  MoreVertical
} from 'lucide-react-native';

export default function ListDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fetchListById, deleteList, isLoading: listLoading } = useWordListStore();

  const [list, setList] = useState<any>(null);
  const [words, setWords] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoading(true);
      try {
        const listData = await fetchListById(id);
        setList(listData);

        const wordsData = await getWordsInList(id);
        setWords(wordsData);
      } catch (error) {
        console.error('Error loading list details:', error);
        Alert.alert('Hata', 'Liste detayları yüklenirken bir hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleDeleteList = () => {
    Alert.alert(
      'Listeyi Sil',
      'Bu listeyi silmek istediğinize emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          onPress: async () => {
            try {
              await deleteList(id);
              router.replace('/(tabs)/lists');
            } catch (error) {
              console.error('Delete list error:', error);
              Alert.alert('Hata', 'Liste silinirken bir hata oluştu');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleDeleteWord = async (wordId: string) => {
    Alert.alert(
      'Kelimeyi Sil',
      'Bu kelimeyi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          onPress: async () => {
            try {
              await deleteWord(wordId, id);
              // Update local state
              setWords(words.filter(word => word.id !== wordId));
            } catch (error) {
              console.error('Delete word error:', error);
              Alert.alert('Hata', 'Kelime silinirken bir hata oluştu');
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  const handleStartLearning = () => {
    if (words.length === 0) {
      Alert.alert('Uyarı', 'Öğrenmeye başlamak için listeye kelime eklemelisiniz');
      return;
    }

    router.push(`/learn/${id}`);
  };

  const handleStartTest = () => {
    if (words.length === 0) {
      Alert.alert('Uyarı', 'Test başlatmak için listeye kelime eklemelisiniz');
      return;
    }

    router.push(`/test/${id}`);
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorText, { color: colors.error }]}>
          Liste bulunamadı
        </Text>
      </View>
    );
  }

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Tarih yok';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <View style={styles.header}>
        <View style={styles.listInfo}>
          <View style={styles.languageContainer}>
            <Languages size={16} color={colors.primary} />
            <Text style={[styles.language, { color: colors.textSecondary }]}>
              {list.language} → {list.targetLanguage}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <BookOpen size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {list.wordCount || 0} kelime
              </Text>
            </View>

            <View style={styles.statItem}>
              <Clock size={16} color={colors.primary} />
              <Text style={[styles.statText, { color: colors.textSecondary }]}>
                {formatDate(list.updatedAt)}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.primary + '20' }]}
            onPress={() => router.push(`/list/edit/${id}`)}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: colors.error + '20' }]}
            onPress={handleDeleteList}
          >
            <Trash2 size={20} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.description}>
        <Text style={[styles.descriptionText, { color: colors.text }]}>
          {list.description}
        </Text>
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Öğren"
          leftIcon={<Brain size={18} color="#FFFFFF" />}
          onPress={handleStartLearning}
          style={styles.button}
        />

        <Button
          title="Test Et"
          variant="secondary"
          leftIcon={<PenTool size={18} color="#FFFFFF" />}
          onPress={handleStartTest}
          style={styles.button}
        />
      </View>

      <View style={styles.wordsHeader}>
        <Text style={[styles.wordsTitle, { color: colors.text }]}>
          Kelimeler
        </Text>

        <Button
          title="Kelime Ekle"
          size="small"
          leftIcon={<Plus size={16} color="#FFFFFF" />}
          onPress={() => router.push(`/word/add/${id}`)}
        />
      </View>

      {words.length === 0 ? (
        <EmptyState
          title="Henüz kelime eklenmemiş"
          description="Bu listeye kelime ekleyerek öğrenmeye başlayın"
          buttonTitle="Kelime Ekle"
          onButtonPress={() => router.push(`/word/add/${id}`)}
          icon={<BookOpen size={40} color={colors.primary} />}
        />
      ) : (
        <FlatList
          data={words}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <WordCard
              word={item}
              onEdit={() => router.push(`/word/edit/${item.id}`)}
              onDelete={() => handleDeleteWord(item.id)}
            />
          )}
          contentContainerStyle={styles.wordsList}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  listInfo: {
    flex: 1,
  },
  languageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  language: {
    fontSize: 14,
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 4,
  },
  statText: {
    fontSize: 14,
    marginLeft: 6,
  },
  actions: {
    flexDirection: 'row',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  description: {
    marginBottom: 16,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  wordsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  wordsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  wordsList: {
    paddingBottom: 20,
  },
});