import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { getWord, updateWord, deleteWord } from '@/firebase/wordLists';
import { useWordListStore } from '@/store/wordListStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { FileText, Volume2, BookOpen, Save, Trash2 } from 'lucide-react-native';

export default function EditWordScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fetchListById } = useWordListStore();

  const [word, setWord] = useState<any>(null);
  const [list, setList] = useState<any>(null);
  const [term, setTerm] = useState('');
  const [definition, setDefinition] = useState('');
  const [example, setExample] = useState('');
  const [pronunciation, setPronunciation] = useState('');
  const [notes, setNotes] = useState('');

  const [errors, setErrors] = useState({
    term: '',
    definition: '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setIsLoadingData(true);
      try {
        const wordData = await getWord(id);
        setWord(wordData);

        // Set form values
        setTerm(wordData.term || '');
        setDefinition(wordData.definition || '');
        setExample(wordData.example || '');
        setPronunciation(wordData.pronunciation || '');
        setNotes(wordData.notes || '');

        // Load list data
        const listData = await fetchListById(wordData.listId || '');
        setList(listData);
      } catch (error) {
        console.error('Error loading word data:', error);
        Alert.alert('Hata', 'Kelime yüklenirken bir hata oluştu');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadData();
  }, [id]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      term: '',
      definition: '',
    };

    if (!term.trim()) {
      newErrors.term = 'Kelime gereklidir';
      isValid = false;
    }

    if (!definition.trim()) {
      newErrors.definition = 'Tanım gereklidir';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateWord = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      await updateWord(id, {
        term,
        definition,
        example: example || undefined,
        pronunciation: pronunciation || undefined,
        notes: notes || undefined,
      });

      Alert.alert(
        'Kelime Güncellendi',
        'Kelime başarıyla güncellendi',
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Update word error:', error);
      Alert.alert('Hata', 'Kelime güncellenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWord = async () => {
    Alert.alert(
      'Kelimeyi Sil',
      'Bu kelimeyi silmek istediğinize emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        {
          text: 'Sil',
          onPress: async () => {
            setIsLoading(true);
            try {
              await deleteWord(id, word.listId);
              router.replace(`/list/${word.listId}`);
            } catch (error) {
              console.error('Delete word error:', error);
              Alert.alert('Hata', 'Kelime silinirken bir hata oluştu');
              setIsLoading(false);
            }
          },
          style: 'destructive'
        },
      ]
    );
  };

  if (isLoadingData) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: colors.text }]}>
                Kelimeyi Düzenle
              </Text>
              <Text style={[styles.listName, { color: colors.primary }]}>
                {list?.name}
              </Text>
            </View>
            <BookOpen size={30} color={colors.primary} />
          </View>

          <View style={styles.form}>
            <Input
              label="Kelime"
              value={term}
              onChangeText={setTerm}
              placeholder={`${list?.targetLanguage} kelime`}
              leftIcon={<FileText size={20} color={colors.primary} />}
              error={errors.term}
            />

            <Input
              label="Tanım"
              value={definition}
              onChangeText={setDefinition}
              placeholder={`${list?.language} anlamı`}
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={styles.definitionInput}
              error={errors.definition}
            />

            <Input
              label="Örnek Cümle (İsteğe Bağlı)"
              value={example}
              onChangeText={setExample}
              placeholder="Kelimenin kullanıldığı bir örnek cümle"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={styles.exampleInput}
            />

            <Input
              label="Telaffuz (İsteğe Bağlı)"
              value={pronunciation}
              onChangeText={setPronunciation}
              placeholder="Telaffuz rehberi"
              leftIcon={<Volume2 size={20} color={colors.primary} />}
            />

            <Input
              label="Notlar (İsteğe Bağlı)"
              value={notes}
              onChangeText={setNotes}
              placeholder="Ek notlar veya ipuçları"
              multiline
              numberOfLines={2}
              textAlignVertical="top"
              style={styles.notesInput}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="Sil"
                variant="outline"
                leftIcon={<Trash2 size={18} color={colors.error} />}
                onPress={handleDeleteWord}
                style={[styles.deleteButton, { borderColor: colors.error }]}
                textStyle={{ color: colors.error }}
              />
              <Button
                title="Kaydet"
                onPress={handleUpdateWord}
                isLoading={isLoading}
                leftIcon={<Save size={18} color="#FFFFFF" />}
                style={styles.saveButton}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  listName: {
    fontSize: 16,
    marginTop: 4,
  },
  form: {
    width: '100%',
  },
  definitionInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  exampleInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  notesInput: {
    minHeight: 80,
    paddingTop: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
  },
  deleteButton: {
    flex: 1,
    marginRight: 6,
  },
  saveButton: {
    flex: 2,
    marginLeft: 6,
  },
});