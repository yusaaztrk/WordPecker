import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { useWordListStore } from '@/store/wordListStore';
import Input from '@/components/Input';
import Button from '@/components/Button';
import { BookOpen, Languages, Info } from 'lucide-react-native';

const languages = [
  'Türkçe',
  'İngilizce',
  'Almanca',
  'Fransızca',
  'İspanyolca',
  'İtalyanca',
  'Rusça',
  'Japonca',
  'Çince',
  'Korece',
  'Arapça',
];

export default function CreateListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { createList, isLoading } = useWordListStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('Türkçe');
  const [targetLanguage, setTargetLanguage] = useState('İngilizce');
  const [source, setSource] = useState('');
  
  const [errors, setErrors] = useState({
    name: '',
    description: '',
  });
  
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
  
  const handleCreateList = async () => {
    if (!validateForm()) {
      return;
    }
    
    try {
      const newList = await createList({
        name,
        description,
        language,
        targetLanguage,
        source: source || undefined,
        isPublic: false,
        wordCount: 0,
      });
      
      Alert.alert(
        'Liste Oluşturuldu',
        'Şimdi listeye kelime eklemek ister misiniz?',
        [
          {
            text: 'Daha Sonra',
            onPress: () => router.push('/(tabs)/lists'),
            style: 'cancel',
          },
          {
            text: 'Kelime Ekle',
            onPress: () => router.push(`/word/add/${newList.id}`),
          },
        ]
      );
    } catch (error) {
      console.error('Create list error:', error);
      Alert.alert('Hata', 'Liste oluşturulurken bir hata oluştu');
    }
  };
  
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
              Yeni Liste Oluştur
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
                title="Liste Oluştur"
                onPress={handleCreateList}
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