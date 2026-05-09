import sys

filepath = r'c:\Users\pc\antigravity\dropos\backend\frontend\assets\app.js'

with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find the location of the damage
# We know it's around "Prefer server env var"
target_line = -1
for i, line in enumerate(lines):
    if "Prefer server env var" in line:
        target_line = i
        break

if target_line != -1:
    # Look for the end of the damage
    end_damage = -1
    for i in range(target_line + 1, len(lines)):
        if "async function loadSchedulerStatus" in line or "loadSchedulerStatus" in lines[i]:
            end_damage = i
            break
    
    if end_damage != -1:
        # Reconstruct the missing piece
        restoration = [
            "        </div>\n",
            "        <div style=\"display:flex;gap:8px;flex-wrap:wrap\">\n",
            "          <button class=\"btn btn-sm\" onclick=\"backupToSheets()\">Backup DB now</button>\n",
            "          <button class=\"btn btn-sm btn-amber\" onclick=\"restoreFromSheets()\">Restore from Sheets</button>\n",
            "          <button class=\"btn btn-sm\" onclick=\"exportToSheets()\">Export approved list</button>\n",
            "        </div>\n",
            "      </div>\n",
            "\n",
            "      <div class=\"card\" style=\"border:1px solid var(--red-d)\">\n",
            "        <div class=\"card-title\" style=\"color:var(--red)\">Danger zone</div>\n",
            "        <div style=\"font-size:11px;color:var(--t3);margin-bottom:12px\">Permanently delete all products, jobs, and history. This action cannot be undone.</div>\n",
            "        <button class=\"btn btn-sm btn-danger\" onclick=\"resetDatabase()\">Reset database</button>\n",
            "      </div>\n",
            "\n",
            "    </div>`;\n",
            "  setTimeout(loadSchedulerStatus, 150);\n",
            "  setTimeout(loadReplyLog, 200);\n",
            "}\n",
            "\n"
        ]
        
        new_lines = lines[:target_line+1] + restoration + lines[end_damage:]
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        print("Restoration successful.")
    else:
        print("Could not find end of damage.")
else:
    print("Could not find target line.")
