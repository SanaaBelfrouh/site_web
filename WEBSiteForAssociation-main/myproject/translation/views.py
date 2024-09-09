from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import torch
import json
import requests
from transformers import BartTokenizer, BartForConditionalGeneration, Wav2Vec2CTCTokenizer, Wav2Vec2Processor, Wav2Vec2ForCTC
from pyarabic.araby import strip_tatweel, strip_tashkeel
import re
from langdetect import detect
from deep_translator import GoogleTranslator
import librosa
from django.conf import settings
from pydub import AudioSegment
import tempfile
import os
import librosa

# Load the models and tokenizers
tokenizer = BartTokenizer.from_pretrained("models/best_model")
model = BartForConditionalGeneration.from_pretrained("models/best_model")
with open("models/best_model/generation_config.json", "r") as f:
    gen_config = json.load(f)

wav2vec_tokenizer = Wav2Vec2CTCTokenizer("models/vocab/vocab.json", unk_token="[UNK]", pad_token="[PAD]", word_delimiter_token="|")
wav2vec_processor = Wav2Vec2Processor.from_pretrained('boumehdi/wav2vec2-large-xlsr-moroccan-darija', tokenizer=wav2vec_tokenizer)
wav2vec_model = Wav2Vec2ForCTC.from_pretrained('boumehdi/wav2vec2-large-xlsr-moroccan-darija')

prepositions = ["في", "إلى", "من", "على", "مع", "ب", "ل", "لل", "ك", "ڭدّام", "مورا", "فوڭ", "تحت", "علا", "بعد", "ضدّ", "فوسط", "بحال", "ف", "بسباب", "قبل", "حدا", "بين", "بواسطة", "فوقت", "ماعادا", "تابع", "زائد", "إلا", "بما فيها", "داخل", "خارج", "بالنسبة", "ف اتجاه", "حتال", "معا", "حيت", "باش"]

def preprocess_text(text):
    text = re.sub(r'[^\u0600-\u06FF\s]', '', text)
    text = strip_tatweel(text)
    text = strip_tashkeel(text)
    text = re.sub(r'\s+', ' ', text)
    text = re.sub(r'[؟,.]+', '', text)
    text = re.sub(r'\bال(\S+)\b', r'\1', text)
    text = re.sub(r'\bلل(\S+)\b', r'\1', text)
    text = re.sub(r'\b(?:' + '|'.join(prepositions) + r')\b', '', text)
    return text.strip()

def LAT2AR(word):
    path = f"https://api.yamli.com/transliterate.ashx?word={word}&tool=api&account_id=000006&prot=https:&hostname=www.yamli.com&path=/&build=5515"
    response = requests.get(path)
    html = response.content
    try:
        newWord = json.loads(html.decode("utf-8"))["r"].split("|")[0].rsplit('/',1)[0]
    except:
        return word
    return word if newWord == "" else newWord

def translate(text):
    newtext = []
    text = re.sub(r"[,.;@/#?\!&$]+\ *", " ", text)
    text = text.split(' ')
    blist = [1 if (len(txt)>1 and detect(txt) in['fr','en']) else 0 for txt in text]
    try:
        for i in range(len(blist)):
            if blist[i] == 1:
                newtext.append(GoogleTranslator(source='auto', target='ar').translate(text[i]))
            else:
                newtext.append(LAT2AR(text[i].strip()))
    except:
        print(text[i])
        newtext.append(LAT2AR(text[i].strip()))
    return ' '.join(newtext)

def generate_gloss_sequence(model, tokenizer, sentence, gen_config):
    model.eval()
    inputs = tokenizer.encode_plus(sentence, return_tensors='pt', truncation=True, max_length=50)
    input_ids = inputs['input_ids']
    attention_mask = inputs['attention_mask']
    gen_config_dict = gen_config.copy()
    gen_config_dict.pop('max_length', None)
    outputs = model.generate(input_ids=input_ids, attention_mask=attention_mask, max_length=50, **gen_config_dict)
    gloss_sequence = tokenizer.decode(outputs[0], skip_special_tokens=True)
    return gloss_sequence

def convert_audio_to_wav(audio_path):
    # Convert audio file to WAV format
    audio = AudioSegment.from_file(audio_path)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as temp_wav:
        audio.export(temp_wav.name, format="wav")
        temp_wav_path = temp_wav.name
    return temp_wav_path

def resample_audio(audio_path, target_sr=16000):
    audio, sr = librosa.load(audio_path, sr=None)  # Load with original sample rate
    resampled_audio = librosa.resample(audio, orig_sr=sr, target_sr=target_sr)
    return resampled_audio

def audio_to_text(audio_path):
    # Convert audio to WAV if necessary
    audio_path = convert_audio_to_wav(audio_path)

    input_audio, sr = librosa.load(audio_path, sr=None)  # Load with original sample rate
    input_audio = resample_audio(audio_path)  # Resample to the target sample rate
    input_values = wav2vec_processor(input_audio, return_tensors="pt", padding=True).input_values
    logits = wav2vec_model(input_values).logits
    tokens = torch.argmax(logits, axis=-1)
    transcription = wav2vec_tokenizer.batch_decode(tokens)
    print(transcription)
    return transcription[0]
class TranslateTextView(APIView):
    def post(self, request):
        try:
            input_type = request.data.get('type', 'text')
            if input_type == 'audio':
                audio_file = request.FILES.get('file')
                audio_path =f'{settings.MEDIA_ROOT}/{audio_file.name}'
                with open(audio_path, 'wb+') as destination:
                    for chunk in audio_file.chunks():
                        destination.write(chunk)
                sentence = audio_to_text(audio_path)
            else:
                sentence = request.data.get('text', '')
            
            if detect(sentence) != 'ar':
                sentence = translate(sentence)
            
            sentence = preprocess_text(sentence)
            gloss_sequence = generate_gloss_sequence(model, tokenizer, sentence, gen_config)
            return Response({"gloss": gloss_sequence}, status=status.HTTP_200_OK)
        
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
