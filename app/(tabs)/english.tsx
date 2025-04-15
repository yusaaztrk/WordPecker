import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '@/components/ThemeProvider';
import { MapPin, BookOpen, RefreshCw, GraduationCap, Camera } from 'lucide-react-native';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function TabEnglish() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>İngilizce Öğren</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            Çeşitli yöntemlerle İngilizce kelimeler öğrenin
          </Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <GraduationCap size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Kelime Öğrenme</Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Yeni İngilizce kelimeler öğrenin ve tekrar edin
          </Text>
          <Button
            title="Kelimeleri Gör"
            onPress={() => router.push('/english')}
            style={styles.cardButton}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Konum Tabanlı Öğrenme</Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Bulunduğunuz yerdeki mekanların İngilizce karşılıklarını öğrenin
          </Text>
          <Button
            title="Konuma Göre Öğren"
            onPress={() => router.push('/english/location')}
            style={styles.cardButton}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <Camera size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Fotoğrafla Öğren</Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Fotoğraf çekerek nesnelerin İngilizce karşılıklarını öğrenin
          </Text>

          <View style={styles.imageExamples}>
            <Image
              source={{ uri: 'https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?q=80&w=200&auto=format&fit=crop' }}
              style={[styles.exampleImage, { borderColor: colors.border }]}
            />
            <View style={styles.imageLabels}>
              <View style={[styles.imageLabel, { backgroundColor: colors.primary }]}>
                <Text style={styles.labelText}>Apple</Text>
              </View>
              <View style={[styles.imageLabel, { backgroundColor: colors.secondary }]}>
                <Text style={styles.labelText}>Fruit</Text>
              </View>
              <View style={[styles.imageLabel, { backgroundColor: colors.accent }]}>
                <Text style={styles.labelText}>Red</Text>
              </View>
            </View>
          </View>

          <Button
            title="Fotoğrafla Öğren"
            onPress={() => router.push('/english/photo')}
            style={styles.cardButton}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <BookOpen size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>İngilizce Sözlük</Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Kelime anlamlarını ve telaffuzlarını öğrenin
          </Text>
          <Button
            title="Sözlüğe Git"
            onPress={() => router.push('/english/dictionary')}
            style={styles.cardButton}
          />
        </Card>

        <Card style={styles.card}>
          <View style={styles.cardHeader}>
            <RefreshCw size={24} color={colors.primary} />
            <Text style={[styles.cardTitle, { color: colors.text }]}>Kelime Tekrarı</Text>
          </View>
          <Text style={[styles.cardDescription, { color: colors.textSecondary }]}>
            Öğrendiğiniz kelimeleri tekrar edin ve pekiştirin
          </Text>
          <Button
            title="Tekrar Başlat"
            onPress={() => router.push('/english/review')}
            style={styles.cardButton}
          />
        </Card>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  card: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardDescription: {
    marginBottom: 16,
  },
  cardButton: {
    alignSelf: 'flex-start',
  },
  imageExamples: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  exampleImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
    borderWidth: 1,
    marginRight: 16,
  },
  imageLabels: {
    flex: 1,
    gap: 8,
  },
  imageLabel: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  labelText: {
    color: 'white',
    fontWeight: '500',
  },
});
