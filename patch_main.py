import sys

filepath = r'c:\Users\pc\antigravity\dropos\backend\main.py'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the loop
target_str = '"audience":          p.get("audience") or "",'
new_lines = []
found = False

for line in lines:
    new_lines.append(line)
    if target_str in line and not found:
        # Check if we already have it (to avoid double insertion if I retry)
        # Actually I already deleted it in the previous step... let's check what's there now.
        pass

# Since I likely deleted it, let's look for "score": p.get("score") or 0,
for i, line in enumerate(new_lines):
    if '"score":' in line and 'p.get("score")' in line:
        # Insert after this
        new_lines.insert(i+1, '            "audience":          p.get("audience") or "",\n')
        new_lines.insert(i+2, '            "instagram_url":     p.get("instagram_url") or "",\n')
        new_lines.insert(i+3, '        })\n')
        # Remove the potentially corrupted lines after this (the empty lines)
        # The previous diff showed it replaced 2 lines with 1 empty line
        # Let's just be careful.
        break

with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Patch applied.")
