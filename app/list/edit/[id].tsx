import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { BookOpen, Languages, Info } from 'lucide-react-native';

export default function EditListScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const { fetchListById, updateList, isLoading } = useWordListStore();

  const [list, setList] = useState<any>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [source, setSource] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });

  const [isLoadingList, setIsLoadingList] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadList = async () => {
      setIsLoadingList(true);
      try {
        const listData = await fetchListById(id);
        setList(listData);

        // Set form values
        setName(listData.name || '');
        setDescription(listData.description || '');
        setLanguage(listData.language || 'Türkçe');
        setTargetLanguage(listData.targetLanguage || 'İngilizce');
        setSource(listData.source || '');
        setIsPublic(listData.isPublic || false);
      } catch (error) {
        console.error('Error loading list:', error);
        Alert.alert('Hata', 'Liste yüklenirken bir hata oluştu');
      } finally {
        setIsLoadingList(false);
      }
    };

    loadList();
  }, [id]);

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      description: '',
    };

    if (!name.trim()) {
      newErrors.name = 'Liste adı gereklidir';
      isValid = false;
    }

    if (!description.trim()) {
      newErrors.description = 'Açıklama gereklidir';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleUpdateList = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      await updateList(id, {
        name,
        description,
        language,
        targetLanguage,
        source: source || undefined,
        isPublic,
      });

      Alert.alert(
        'Liste Güncellendi',
        'Liste başarıyla güncellendi',
        [
          {
            text: 'Tamam',
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      console.error('Update list error:', error);
      Alert.alert('Hata', 'Liste güncellenirken bir hata oluştu');
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
            <BookOpen size={30} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>
              Listeyi Düzenle
            </Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Liste Adı"
              value={name}
              onChangeText={setName}
              placeholder="Örn: İngilizce Günlük Konuşma"
              error={errors.name}
            />

            <Input
              label="Açıklama"
              value={description}
              onChangeText={setDescription}
              placeholder="Bu liste hakkında kısa bir açıklama"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              style={styles.textArea}
              error={errors.description}
            />

            <View style={styles.languageContainer}>
              <View style={styles.languageField}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Kaynak Dil
                </Text>
                <View style={[
                  styles.pickerContainer,
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}>
                  <Languages size={20} color={colors.primary} style={styles.pickerIcon} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {language}
                  </Text>
                </View>
              </View>

              <View style={styles.languageField}>
                <Text style={[styles.label, { color: colors.text }]}>
                  Hedef Dil
                </Text>
                <View style={[
                  styles.pickerContainer,
                  { backgroundColor: colors.card, borderColor: colors.border }
                ]}>
                  <Languages size={20} color={colors.primary} style={styles.pickerIcon} />
                  <Text style={[styles.pickerText, { color: colors.text }]}>
                    {targetLanguage}
                  </Text>
                </View>
              </View>
            </View>

            <Input
              label="Kaynak (İsteğe Bağlı)"
              value={source}
              onChangeText={setSource}
              placeholder="Örn: Kitap, Kurs, Web sitesi"
              leftIcon={<Info size={20} color={colors.primary} />}
            />

            <View style={styles.buttonContainer}>
              <Button
                title="İptal"
                variant="outline"
                onPress={() => router.back()}
                style={styles.button}
              />
              <Button
                title="Kaydet"
                onPress={handleUpdateList}
                isLoading={isLoading}
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
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  form: {
    width: '100%',
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  languageField: {
    width: '48%',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 16,
  },
  pickerIcon: {
    marginRight: 8,
  },
  pickerText: {
    fontSize: 16,
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