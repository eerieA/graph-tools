import { invoke } from '@tauri-apps/api/core'

export async function summarizeChoiceViaTauri (text: string): Promise<string> {
  try {
    const result = await invoke<string>('summarize_choice_text', {
      text,
      maxLength: 40
    })
    return result
  } catch (err) {
    console.error('Error summarizing text:', err)
    // fallback
    return text
  }
}
