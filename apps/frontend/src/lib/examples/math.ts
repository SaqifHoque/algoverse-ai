import type { ExampleSnippet } from "@/lib/examples/types";

export const MATH_EXAMPLES: ExampleSnippet[] = [
  { key: "math_prime", label: "Prime Number Check", category: "math", kind: "algorithm", description: "Test possible divisors only up to the square root.", complexity: "O(√n)", source_code: `def is_prime(number):
    if number < 2:
        return False
    divisor = 2
    while divisor * divisor <= number:
        if number % divisor == 0:
            return False
        divisor += 1
    return True
`, entrypoint: "is_prime", args: [29] },
  { key: "math_primes", label: "List Primes with a Sieve", category: "math", kind: "algorithm", description: "Cross out multiples of each discovered prime.", complexity: "O(n log log n)", source_code: `def sieve(limit):
    prime = [True] * (limit + 1)
    prime[0] = False
    prime[1] = False
    value = 2
    while value * value <= limit:
        if prime[value]:
            for multiple in range(value * value, limit + 1, value):
                prime[multiple] = False
        value += 1
    return [i for i in range(limit + 1) if prime[i]]
`, entrypoint: "sieve", args: [30] },
  { key: "math_gcd", label: "Greatest Common Divisor", category: "math", kind: "algorithm", description: "Repeatedly replace numbers with a remainder pair.", complexity: "O(log n)", source_code: `def greatest_common_divisor(a, b):
    while b != 0:
        a, b = b, a % b
    return a
`, entrypoint: "greatest_common_divisor", args: [84, 30] },
  { key: "math_lcm", label: "Least Common Multiple", category: "math", kind: "algorithm", description: "Use the relationship between GCD and LCM.", complexity: "O(log n)", source_code: `def least_common_multiple(a, b):
    first = a
    second = b
    while second != 0:
        first, second = second, first % second
    return abs(a * b) // first
`, entrypoint: "least_common_multiple", args: [12, 18] },
  { key: "math_digits", label: "Sum the Digits", category: "math", kind: "algorithm", description: "Peel off one base-10 digit at a time.", complexity: "O(log n)", source_code: `def digit_sum(number):
    number = abs(number)
    total = 0
    while number > 0:
        total += number % 10
        number //= 10
    return total
`, entrypoint: "digit_sum", args: [5832] },
  { key: "math_reverse_number", label: "Reverse an Integer", category: "math", kind: "algorithm", description: "Move digits into a new number from right to left.", complexity: "O(log n)", source_code: `def reverse_number(number):
    result = 0
    while number > 0:
        result = result * 10 + number % 10
        number //= 10
    return result
`, entrypoint: "reverse_number", args: [12345] },
  { key: "math_armstrong", label: "Armstrong Number Check", category: "math", kind: "algorithm", description: "Raise every digit to the number of digits.", complexity: "O(log n)", source_code: `def is_armstrong(number):
    digits = str(number)
    power = len(digits)
    total = 0
    for digit in digits:
        total += int(digit) ** power
    return total == number
`, entrypoint: "is_armstrong", args: [153] },
  { key: "math_factors", label: "Find All Factors", category: "math", kind: "algorithm", description: "Collect divisor pairs up to the square root.", complexity: "O(√n)", source_code: `def all_factors(number):
    small = []
    large = []
    divisor = 1
    while divisor * divisor <= number:
        if number % divisor == 0:
            small.append(divisor)
            if divisor != number // divisor:
                large.append(number // divisor)
        divisor += 1
    large.reverse()
    return small + large
`, entrypoint: "all_factors", args: [36] },
  { key: "math_decimal_binary", label: "Decimal to Binary", category: "math", kind: "algorithm", description: "Repeatedly divide by two and record remainders.", complexity: "O(log n)", source_code: `def decimal_to_binary(number):
    if number == 0:
        return "0"
    bits = ""
    while number > 0:
        bits = str(number % 2) + bits
        number //= 2
    return bits
`, entrypoint: "decimal_to_binary", args: [42] },
  { key: "math_pascal", label: "Pascal's Triangle", category: "math", kind: "algorithm", description: "Build each row from neighboring values above it.", complexity: "O(n²)", source_code: `def pascal_triangle(rows):
    triangle = []
    for row_index in range(rows):
        row = [1] * (row_index + 1)
        for column in range(1, row_index):
            row[column] = triangle[row_index - 1][column - 1] + triangle[row_index - 1][column]
        triangle.append(row)
    return triangle
`, entrypoint: "pascal_triangle", args: [5] },
];
