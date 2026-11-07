export interface Preset {
  id: string;
  title: string;
  description: string;
  script: string;
}

export const PRESETS: Preset[] = [
  {
    id: "angkor-wat",
    title: "Angkor Wat",
    description: "History & heritage",
    script:
      "អង្គរវត្តគឺជាប្រាសាទដ៏ធំបំផុតមួយនៅលើពិភពលោក៕\nវាត្រូវបានសាងសង់ឡើងក្នុងសតវត្សទី១២ដោយព្រះបាទសូរ្យវរ្ម័នទី២៕\nប្រាសាទនេះតំណាងឱ្យវប្បធម៌ និងប្រវត្តិសាស្ត្រដ៏រុងរឿងរបស់ជនជាតិខ្មែរ៕",
  },
  {
    id: "ai-future",
    title: "AI & The Future",
    description: "Artificial intelligence",
    script:
      "បញ្ញាសិប្បនិម្មិតកំពុងផ្លាស់ប្តូរពិភពលោកយ៉ាងឆាប់រហ័ស៕\nម៉ាស៊ីនកុំព្យូទ័រឥឡូវនេះអាចរៀន គិត និងសម្រេចចិត្តដូចមនុស្ស៕\nនេះជាឱកាស ប៉ុន្តែក៏ជាការប្រកួតប្រជែងផងដែរ៕",
  },
  {
    id: "bakong-payments",
    title: "Bakong & Digital Payments",
    description: "Finance & fintech",
    script:
      "បាគងគឺជាប្រព័ន្ធទូទាត់ប្រាក់ឌីជីថលរបស់ប្រទេសកម្ពុជា៕\nវាអនុញ្ញាតឱ្យប្រជាជនផ្ញើ និងទទួលប្រាក់បានយ៉ាងឆាប់រហ័ស ដោយសុវត្ថិភាព៕\nនេះជាជំហានធំមួយឆ្ពោះទៅរកសេដ្ឋកិច្ចឌីជីថល៕",
  },
];

export const DEFAULT_PRESET_ID = PRESETS[0].id;
