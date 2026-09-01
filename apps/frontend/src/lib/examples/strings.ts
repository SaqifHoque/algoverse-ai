import type { ExampleSnippet } from "@/lib/examples/types";

export const STRING_EXAMPLES: ExampleSnippet[] = [
  { key: "string_reverse", label: "Reverse a String", category: "strings", kind: "data_structure", description: "Build a reversed string one character at a time.", complexity: "O(n)", source_code: `def reverse_string(text):
    result = ""
    for ch in text:
        result = ch + result
    return result
`, entrypoint: "reverse_string", args: ["algorithm"] },
  { key: "string_palindrome", label: "Palindrome Check", category: "strings", kind: "data_structure", description: "Compare characters from both ends.", complexity: "O(n)", source_code: `def is_palindrome(text):
    left = 0
    right = len(text) - 1
    while left < right:
        if text[left] != text[right]:
            return False
        left += 1
        right -= 1
    return True
`, entrypoint: "is_palindrome", args: ["racecar"] },
  { key: "string_count_vowels", label: "Count Vowels", category: "strings", kind: "data_structure", description: "Scan text and classify each character.", complexity: "O(n)", source_code: `def count_vowels(text):
    count = 0
    for ch in text.lower():
        if ch in "aeiou":
            count += 1
    return count
`, entrypoint: "count_vowels", args: ["Hello AlgoVerse"] },
  { key: "string_word_count", label: "Count Words", category: "strings", kind: "data_structure", description: "Detect transitions into new words.", complexity: "O(n)", source_code: `def word_count(text):
    count = 0
    inside_word = False
    for ch in text:
        if ch != " " and not inside_word:
            count += 1
            inside_word = True
        elif ch == " ":
            inside_word = False
    return count
`, entrypoint: "word_count", args: ["learn one step at a time"] },
  { key: "string_char_frequency", label: "Character Frequency", category: "strings", kind: "data_structure", description: "Count each character with a dictionary.", complexity: "O(n)", source_code: `def char_frequency(text):
    counts = {}
    for ch in text:
        counts[ch] = counts.get(ch, 0) + 1
    return counts
`, entrypoint: "char_frequency", args: ["banana"] },
  { key: "string_anagram", label: "Anagram Check", category: "strings", kind: "data_structure", description: "Balance character counts between two words.", complexity: "O(n)", source_code: `def are_anagrams(first, second):
    if len(first) != len(second):
        return False
    counts = {}
    for ch in first:
        counts[ch] = counts.get(ch, 0) + 1
    for ch in second:
        counts[ch] = counts.get(ch, 0) - 1
    return all(value == 0 for value in counts.values())
`, entrypoint: "are_anagrams", args: ["listen", "silent"] },
  { key: "string_title_case", label: "Make Title Case", category: "strings", kind: "data_structure", description: "Capitalize the start of each word manually.", complexity: "O(n)", source_code: `def title_case(text):
    result = ""
    start = True
    for ch in text:
        if ch == " ":
            start = True
            result += ch
        elif start:
            result += ch.upper()
            start = False
        else:
            result += ch.lower()
    return result
`, entrypoint: "title_case", args: ["hello algorithm world"] },
  { key: "string_remove_spaces", label: "Remove Extra Spaces", category: "strings", kind: "data_structure", description: "Normalize repeated spaces between words.", complexity: "O(n)", source_code: `def remove_extra_spaces(text):
    words = text.split()
    result = ""
    for word in words:
        if result:
            result += " "
        result += word
    return result
`, entrypoint: "remove_extra_spaces", args: ["  data   structures  are fun "] },
  { key: "string_longest_word", label: "Find the Longest Word", category: "strings", kind: "data_structure", description: "Keep the best word seen so far.", complexity: "O(n)", source_code: `def longest_word(text):
    longest = ""
    for word in text.split():
        if len(word) > len(longest):
            longest = word
    return longest
`, entrypoint: "longest_word", args: ["visual learning makes algorithms memorable"] },
  { key: "string_run_length", label: "Run-Length Encoding", category: "strings", kind: "data_structure", description: "Compress consecutive repeated characters.", complexity: "O(n)", source_code: `def run_length_encode(text):
    if not text:
        return ""
    result = ""
    count = 1
    for i in range(1, len(text)):
        if text[i] == text[i - 1]:
            count += 1
        else:
            result += text[i - 1] + str(count)
            count = 1
    return result + text[-1] + str(count)
`, entrypoint: "run_length_encode", args: ["aaabbccccd"] },
];
