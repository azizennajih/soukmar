// Appends the "chatimg" block to all 11 i18n files (CRLF kept, no JSON.stringify of the whole file).
const fs = require('fs'), path = require('path');
const keys = ['label','attach','camera','gallery','file','remove','alt','close','uploading','err_type','err_big','err_upload'];
const T = {
 de:['Bild','Bild anhängen','Foto aufnehmen','Aus Galerie wählen','Datei hochladen','Bild entfernen','Gesendetes Bild','Schließen','Bild wird hochgeladen …','Bitte ein Bild wählen (JPG, PNG, WebP oder GIF).','Das Bild ist zu groß (max. 10 MB).','Das Bild konnte nicht gesendet werden. Bitte erneut versuchen.'],
 en:['Photo','Attach a photo','Take a photo','Choose from gallery','Upload a file','Remove photo','Sent photo','Close','Uploading photo …','Please choose an image (JPG, PNG, WebP or GIF).','The image is too large (max. 10 MB).','The photo could not be sent. Please try again.'],
 fr:['Image','Joindre une image','Prendre une photo','Choisir dans la galerie','Téléverser un fichier','Retirer l\'image','Image envoyée','Fermer','Envoi de l\'image …','Veuillez choisir une image (JPG, PNG, WebP ou GIF).','L\'image est trop volumineuse (10 Mo max.).','L\'image n\'a pas pu être envoyée. Veuillez réessayer.'],
 es:['Imagen','Adjuntar imagen','Hacer una foto','Elegir de la galería','Subir un archivo','Quitar imagen','Imagen enviada','Cerrar','Subiendo imagen …','Elige una imagen (JPG, PNG, WebP o GIF).','La imagen es demasiado grande (máx. 10 MB).','No se pudo enviar la imagen. Inténtalo de nuevo.'],
 it:['Immagine','Allega un\'immagine','Scatta una foto','Scegli dalla galleria','Carica un file','Rimuovi immagine','Immagine inviata','Chiudi','Caricamento immagine …','Scegli un\'immagine (JPG, PNG, WebP o GIF).','L\'immagine è troppo grande (max. 10 MB).','Impossibile inviare l\'immagine. Riprova.'],
 pt:['Imagem','Anexar imagem','Tirar uma foto','Escolher da galeria','Carregar um ficheiro','Remover imagem','Imagem enviada','Fechar','A carregar imagem …','Escolha uma imagem (JPG, PNG, WebP ou GIF).','A imagem é demasiado grande (máx. 10 MB).','Não foi possível enviar a imagem. Tente novamente.'],
 tr:['Fotoğraf','Fotoğraf ekle','Fotoğraf çek','Galeriden seç','Dosya yükle','Fotoğrafı kaldır','Gönderilen fotoğraf','Kapat','Fotoğraf yükleniyor …','Lütfen bir görsel seçin (JPG, PNG, WebP veya GIF).','Görsel çok büyük (en fazla 10 MB).','Fotoğraf gönderilemedi. Lütfen tekrar deneyin.'],
 ar:['صورة','إرفاق صورة','التقاط صورة','اختيار من المعرض','رفع ملف','إزالة الصورة','الصورة المُرسلة','إغلاق','جارٍ رفع الصورة …','يرجى اختيار صورة (JPG أو PNG أو WebP أو GIF).','الصورة كبيرة جدًا (الحد الأقصى 10 ميغابايت).','تعذّر إرسال الصورة. يرجى المحاولة مرة أخرى.'],
 fa:['تصویر','پیوست تصویر','گرفتن عکس','انتخاب از گالری','بارگذاری فایل','حذف تصویر','تصویر ارسال‌شده','بستن','در حال بارگذاری تصویر …','لطفاً یک تصویر انتخاب کنید (JPG، PNG، WebP یا GIF).','تصویر بسیار بزرگ است (حداکثر ۱۰ مگابایت).','ارسال تصویر ممکن نشد. لطفاً دوباره تلاش کنید.'],
 ur:['تصویر','تصویر منسلک کریں','تصویر کھینچیں','گیلری سے منتخب کریں','فائل اپ لوڈ کریں','تصویر ہٹائیں','بھیجی گئی تصویر','بند کریں','تصویر اپ لوڈ ہو رہی ہے …','براہ کرم تصویر منتخب کریں (JPG، PNG، WebP یا GIF)۔','تصویر بہت بڑی ہے (زیادہ سے زیادہ 10 MB)۔','تصویر نہیں بھیجی جا سکی۔ براہ کرم دوبارہ کوشش کریں۔'],
 ps:['انځور','انځور ضمیمه کړئ','انځور واخلئ','له ګالري وټاکئ','فایل پورته کړئ','انځور لرې کړئ','لیږل شوی انځور','بندول','انځور پورته کیږي …','مهرباني وکړئ یو انځور وټاکئ (JPG، PNG، WebP یا GIF).','انځور ډېر لوی دی (تر ۱۰ MB پورې).','انځور ونه لیږل شو. مهرباني وکړئ بیا هڅه وکړئ.'],
};
for (const [lang, vals] of Object.entries(T)) {
  const p = path.join(__dirname, '..', 'src', 'assets', 'i18n', lang + '.json');
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('"chatimg"')) { console.log('skip', lang); continue; }
  const nl = s.includes('\r\n') ? '\r\n' : '\n';
  const idx = s.lastIndexOf('}');
  const head = s.slice(0, idx).replace(/\s+$/, '');
  const obj = {}; keys.forEach((k, i) => obj[k] = vals[i]);
  const block = '  "chatimg": ' + JSON.stringify(obj, null, 2).replace(/\n/g, nl + '  ').replace(/^/, '');
  s = head + ',' + nl + block + nl + '}' + s.slice(idx + 1);
  JSON.parse(s);
  fs.writeFileSync(p, s);
  console.log('ok', lang);
}
