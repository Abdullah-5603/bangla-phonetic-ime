/*
 * Avro-style Bangla phonetic rules for this terminal MVP.
 *
 * The matching model and romanization choices are inspired by Avro Keyboard
 * and ibus-avro. This file is intentionally small and is not a full copied
 * Avro rule table. If future work ports upstream Avro/ibus-avro rules directly,
 * preserve the upstream MPL notices in LICENSE-AVRO.md, NOTICE.md, and this
 * source header.
 */

export const HASANTA = "\u09CD";

export const vowelRules = [
  ["ough", "ঔ", "ৌ"],
  ["ou", "ঔ", "ৌ"],
  ["au", "ঔ", "ৌ"],
  ["oi", "ঐ", "ৈ"],
  ["ee", "ঈ", "ী"],
  ["ii", "ঈ", "ী"],
  ["oo", "ঊ", "ূ"],
  ["uu", "ঊ", "ূ"],
  ["aa", "আ", "া"],
  ["i", "ই", "ি"],
  ["u", "উ", "ু"],
  ["e", "এ", "ে"],
  ["o", "অ", "ো"],
  ["a", "আ", "া"]
];

export const consonantRules = [
  ["kkh", "ক্ষ"],
  ["ng", "ং"],
  ["kh", "খ"],
  ["gh", "ঘ"],
  ["chh", "ছ"],
  ["ch", "চ"],
  ["jh", "ঝ"],
  ["th", "থ"],
  ["dh", "ধ"],
  ["ph", "ফ"],
  ["bh", "ভ"],
  ["sh", "শ"],
  ["ss", "ষ"],
  ["ny", "ন্য"],
  ["gn", "জ্ঞ"],
  ["k", "ক"],
  ["g", "গ"],
  ["c", "ক"],
  ["j", "জ"],
  ["z", "জ"],
  ["t", "ত"],
  ["d", "দ"],
  ["n", "ন"],
  ["p", "প"],
  ["f", "ফ"],
  ["b", "ব"],
  ["v", "ভ"],
  ["m", "ম"],
  ["r", "র"],
  ["l", "ল"],
  ["s", "স"],
  ["h", "হ"],
  ["y", "য"],
  ["w", "ও"],
  ["q", "ক"],
  ["x", "ক্স"]
];

export const punctuationMap = new Map([
  [".", "।"]
]);

