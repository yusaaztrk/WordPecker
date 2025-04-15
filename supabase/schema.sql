-- Kelime Listeleri Tablosu
CREATE TABLE word_lists (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  language TEXT NOT NULL DEFAULT 'Türkçe',
  target_language TEXT NOT NULL DEFAULT 'İngilizce',
  tags TEXT[] DEFAULT '{}',
  word_count INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT FALSE,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kelimeler Tablosu
CREATE TABLE words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  term TEXT NOT NULL,
  definition TEXT NOT NULL,
  example TEXT,
  notes TEXT,
  pronunciation TEXT,
  image_url TEXT,
  mastery INTEGER DEFAULT 0,
  list_id UUID NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Öğrenme Oturumları Tablosu
CREATE TABLE learning_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  list_id UUID NOT NULL REFERENCES word_lists(id) ON DELETE CASCADE,
  date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  duration INTEGER DEFAULT 0,
  words_studied INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  incorrect_answers INTEGER DEFAULT 0,
  mode TEXT NOT NULL CHECK (mode IN ('learn', 'test')),
  completed BOOLEAN DEFAULT FALSE,
  score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İngilizce Kelimeler Tablosu
CREATE TABLE english_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  word TEXT NOT NULL UNIQUE,
  phonetic TEXT,
  audio_url TEXT,
  meanings JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Konum Tabanlı Kelimeler Tablosu
CREATE TABLE location_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  place_type TEXT NOT NULL,
  turkish_name TEXT NOT NULL,
  english_name TEXT NOT NULL,
  description TEXT,
  example_sentence TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Kullanıcının Öğrendiği Kelimeler Tablosu
CREATE TABLE user_learned_words (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL,
  word_id UUID NOT NULL REFERENCES english_words(id) ON DELETE CASCADE,
  confidence INTEGER DEFAULT 0,
  last_reviewed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, word_id)
);

-- İndeksler
CREATE INDEX idx_word_lists_user_id ON word_lists(user_id);
CREATE INDEX idx_word_lists_created_at ON word_lists(created_at);
CREATE INDEX idx_words_list_id ON words(list_id);
CREATE INDEX idx_learning_sessions_user_id ON learning_sessions(user_id);
CREATE INDEX idx_learning_sessions_list_id ON learning_sessions(list_id);
CREATE INDEX idx_learning_sessions_date ON learning_sessions(date);
CREATE INDEX idx_english_words_word ON english_words(word);
CREATE INDEX idx_user_learned_words_user_id ON user_learned_words(user_id);
CREATE INDEX idx_user_learned_words_word_id ON user_learned_words(word_id);
CREATE INDEX idx_user_learned_words_confidence ON user_learned_words(confidence);
CREATE INDEX idx_user_learned_words_last_reviewed ON user_learned_words(last_reviewed);
CREATE INDEX idx_location_words_place_type ON location_words(place_type);
CREATE INDEX idx_location_words_english_name ON location_words(english_name);

-- RLS (Row Level Security) Politikaları
ALTER TABLE word_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE words ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_sessions ENABLE ROW LEVEL SECURITY;

-- word_lists tablosu için politikalar
CREATE POLICY "Kullanıcılar kendi listelerini görebilir"
  ON word_lists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi listelerini oluşturabilir"
  ON word_lists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi listelerini güncelleyebilir"
  ON word_lists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi listelerini silebilir"
  ON word_lists FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar herkese açık listeleri görebilir"
  ON word_lists FOR SELECT
  USING (is_public = TRUE);

-- words tablosu için politikalar
CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri görebilir"
  ON words FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM word_lists
    WHERE word_lists.id = words.list_id
    AND (word_lists.user_id = auth.uid() OR word_lists.is_public = TRUE)
  ));

CREATE POLICY "Kullanıcılar kendi listelerine kelime ekleyebilir"
  ON words FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM word_lists
    WHERE word_lists.id = words.list_id
    AND word_lists.user_id = auth.uid()
  ));

CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri güncelleyebilir"
  ON words FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM word_lists
    WHERE word_lists.id = words.list_id
    AND word_lists.user_id = auth.uid()
  ));

CREATE POLICY "Kullanıcılar kendi listelerindeki kelimeleri silebilir"
  ON words FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM word_lists
    WHERE word_lists.id = words.list_id
    AND word_lists.user_id = auth.uid()
  ));

-- learning_sessions tablosu için politikalar
CREATE POLICY "Kullanıcılar kendi oturumlarını görebilir"
  ON learning_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi oturumlarını oluşturabilir"
  ON learning_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi oturumlarını güncelleyebilir"
  ON learning_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi oturumlarını silebilir"
  ON learning_sessions FOR DELETE
  USING (auth.uid() = user_id);

-- İngilizce kelimeler tablosu için politikalar
ALTER TABLE english_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes İngilizce kelimeleri görebilir"
  ON english_words FOR SELECT
  USING (true);

CREATE POLICY "Kimlik doğrulaması yapılmış kullanıcılar İngilizce kelime ekleyebilir"
  ON english_words FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Konum kelimeler tablosu için politikalar
ALTER TABLE location_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Herkes konum kelimelerini görebilir"
  ON location_words FOR SELECT
  USING (true);

CREATE POLICY "Kimlik doğrulaması yapılmış kullanıcılar konum kelimesi ekleyebilir"
  ON location_words FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Kullanıcının öğrendiği kelimeler tablosu için politikalar
ALTER TABLE user_learned_words ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Kullanıcılar kendi öğrendikleri kelimeleri görebilir"
  ON user_learned_words FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi öğrendikleri kelimeleri ekleyebilir"
  ON user_learned_words FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi öğrendikleri kelimeleri güncelleyebilir"
  ON user_learned_words FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Kullanıcılar kendi öğrendikleri kelimeleri silebilir"
  ON user_learned_words FOR DELETE
  USING (auth.uid() = user_id);
