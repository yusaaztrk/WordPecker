import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import { createWord } from '@/firebase/words';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { FileText, Volume2, BookOpen, Plus } from 'lucide-react-native';

export default function AddWordScreen() {
  const { listId } = useLocalSearchParams<{ listId: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fetchList } = useWordListStore();
  
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
  const [isLoadingList, setIsLoadingList] = useState(true);
  
  useEffect(() => {
    if (!listId) return;
    
    const loadList = async () => {
      setIsLoadingList(true);
      try {
        const listData = await fetchList(listId);
        setList(listData);
      } catch (error) {
        console.error('Error loading list:', error);
        Alert.alert('Hata', 'Liste yüklenirken bir hata oluştu');
      } finally {
        setIsLoadingList(false);
      }
    };
    
    loadList();
  }, [listId]);
  
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
  
  const handleAddWord = async () => {
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    try {
      await createWord({
        listId,
        term,
        definition,
        example: example || undefined,
        pronunciation: pronunciation || undefined,
        notes: notes || undefined,
      });
      
      Alert.alert(
        'Kelime Eklendi',
        'Kelime başarıyla eklendi',
        [
          {
            text: 'Başka Ekle',
            onPress: () => {
              // Clear form for next word
              setTerm('');
              setDefinition('');
              setExample('');
              setPronunciation('');
              setNotes('');
            },
            style: 'cancel',
          },
          {
            text: 'Listeye Dön',
            onPress: () => router.push(`/list/${listId}`),
          },
        ]
      );
    } catch (error) {
      console.error('Add word error:', error);
      Alert.alert('Hata', 'Kelime eklenirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoadingList) {
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
                Kelime Ekle
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
                title="İptal"
                variant="outline"
                onPress={() => router.back()}
                style={styles.button}
              />
              <Button
                title="Kelime Ekle"
                onPress={handleAddWord}
                isLoading={isLoading}
                leftIcon={<Plus size={18} color="#FFFFFF" />}
                style={styles.button}
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
  button: {
    flex: 1,
    marginHorizontal: 6,
  },
});