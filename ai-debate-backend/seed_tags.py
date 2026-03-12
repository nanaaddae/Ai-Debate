import sqlite3

conn = sqlite3.connect('debate_platform.db')
cursor = conn.cursor()

# Create tags table
cursor.execute('''
CREATE TABLE IF NOT EXISTS tags (
    id INTEGER PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(200)
)
''')

# Create debate_tags association table
cursor.execute('''
CREATE TABLE IF NOT EXISTS debate_tags (
    debate_id INTEGER NOT NULL,
    tag_id INTEGER NOT NULL,
    PRIMARY KEY (debate_id, tag_id),
    FOREIGN KEY (debate_id) REFERENCES debates(id) ON DELETE CASCADE,
    FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
)
''')

# Insert default tags
tags = [
    ("Politics", "politics", "Political debates and policy discussions"),
    ("Technology", "technology", "Tech trends, gadgets, and innovation"),
    ("Science", "science", "Scientific discoveries and theories"),
    ("Ethics", "ethics", "Moral and ethical questions"),
    ("Society", "society", "Social issues and cultural topics"),
    ("Environment", "environment", "Climate, nature, and sustainability"),
    ("Education", "education", "Learning, schools, and academia"),
    ("Health", "health", "Medicine, fitness, and wellness"),
    ("Economics", "economics", "Finance, business, and markets"),
    ("Entertainment", "entertainment", "Movies, music, games, and pop culture"),
    ("Sports", "sports", "Athletic competitions and sporting events"),
    ("Religion", "religion", "Faith, spirituality, and belief systems"),
]

for name, slug, description in tags:
    try:
        cursor.execute(
            "INSERT INTO tags (name, slug, description) VALUES (?, ?, ?)",
            (name, slug, description)
        )
    except sqlite3.IntegrityError:
        print(f"Tag {name} already exists, skipping...")

conn.commit()
conn.close()

print("✅ Tags seeded successfully!")