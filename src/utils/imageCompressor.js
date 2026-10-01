/**
 * Compresses an uploaded image file to a lightweight data URL
 * to allow smooth storage in localStorage and rapid mobile rendering.
 */
export async function compressImageFile(file, maxWidth = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('يرجى اختيار ملف صورة صالح.'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxWidth) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxWidth) / height);
            height = maxWidth;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('تعذر معالجة الصورة'));
          return;
        }

        // Draw image smoothly onto canvas
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(dataUrl);
      };

      img.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
      img.src = e.target.result;
    };

    reader.onerror = () => reject(new Error('تعذر قراءة الملف.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Handles processing of both image and video files
 */
export async function processMediaFile(file) {
  if (!file) throw new Error('الملف غير موجود');

  if (file.type.startsWith('image/')) {
    const url = await compressImageFile(file);
    return { type: 'image', url };
  }

  if (file.type.startsWith('video/')) {
    return new Promise((resolve, reject) => {
      // 35MB safety ceiling for storage
      if (file.size > 35 * 1024 * 1024) {
        reject(new Error('حجم الفيديو كبير (أكثر من 35 ميجابايت). يُفضل وضع رابط خارجي أو اختيار فيديو أقصر.'));
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => resolve({ type: 'video', url: e.target.result });
      reader.onerror = () => reject(new Error('تعذر قراءة ملف الفيديو.'));
      reader.readAsDataURL(file);
    });
  }

  throw new Error('نوع الملف غير مدعوم. يرجى اختيار صورة أو فيديو.');
}
