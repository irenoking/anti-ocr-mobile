package com.antiocrstudio

import android.content.ContentValues
import android.os.Environment
import android.provider.MediaStore
import android.util.Base64
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AntiOcrMediaModule(context: ReactApplicationContext) : ReactContextBaseJavaModule(context) {
  override fun getName() = "AntiOcrMedia"

  @ReactMethod
  fun savePng(dataUrl: String, promise: Promise) {
    try {
      val bytes = Base64.decode(dataUrl.substringAfter(','), Base64.DEFAULT)
      val values = ContentValues().apply {
        put(MediaStore.Images.Media.DISPLAY_NAME, "antiocr_${System.currentTimeMillis()}.png")
        put(MediaStore.Images.Media.MIME_TYPE, "image/png")
        put(MediaStore.Images.Media.RELATIVE_PATH, Environment.DIRECTORY_PICTURES + "/antiocr")
        put(MediaStore.Images.Media.IS_PENDING, 1)
      }
      val resolver = reactApplicationContext.contentResolver
      val uri = resolver.insert(MediaStore.Images.Media.EXTERNAL_CONTENT_URI, values) ?: error("无法创建图片")
      resolver.openOutputStream(uri)?.use { it.write(bytes) } ?: error("无法写入图片")
      values.clear(); values.put(MediaStore.Images.Media.IS_PENDING, 0); resolver.update(uri, values, null, null)
      promise.resolve(uri.toString())
    } catch (e: Exception) { promise.reject("SAVE_FAILED", e) }
  }
}
