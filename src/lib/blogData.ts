export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  category: string;
  date: string;
  readTime: string;
  excerpt: string;
  targetKeywords: string[];
}

export const academyBlogs: BlogPost[] = [
  {
    id: "blog-1",
    title: "The Acoustic Science of Tajweed: Why Pronunciation Alters Brain Wave Patterns",
    slug: "acoustic-science-of-tajweed",
    category: "Science & Linguistics",
    date: "June 05, 2026",
    readTime: "5 min read",
    excerpt: "Discover the physiological and neurological benefits of correct vocal articulation points (Makharij). Learn how rhythmic lengthening stimulates focus and cognitive retention.",
    targetKeywords: ["vocal mechanics of Tajweed", "science of Quranic recitation"]
  },
  {
    id: "blog-2",
    title: "Digital Distractions vs. Hifz: Structuring an At-Home Memorization Sanctuary",
    slug: "digital-distractions-vs-quran-hifz",
    category: "Parenting Guide",
    date: "May 28, 2026",
    readTime: "4 min read",
    excerpt: "A practical framework for parents navigating online learning. Learn how to construct a distraction-free environment that maximizes your child's 1-on-1 live session results.",
    targetKeywords: ["online quran hifz for kids", "home environment for memorization"]
  },
  {
    id: "blog-3",
    title: "The Noorani Qaida Framework: Why Skipping the Phonetic Base Delays Fluency",
    slug: "importance-of-noorani-qaida-framework",
    category: "Foundations",
    date: "May 15, 2026",
    readTime: "6 min read",
    excerpt: "Jumping directly into complete lines of text without finalizing visual character recognition codes causes persistent recitation hesitation. Here is the linguistic proof.",
    targetKeywords: ["importance of noorani qaida", "learn arabic phonics beginners"]
  },
  {
    id: "blog-4",
    title: "Decoding the Ijazah: What Verified Quranic Credentials Actually Signify",
    slug: "decoding-ijazah-certified-teacher-credentials",
    category: "Academic Quality",
    date: "April 30, 2026",
    readTime: "5 min read",
    excerpt: "Understand the historical and academic weight of an authentic Ijazah chain, and explore why verified staff auditing is vital for protecting your child's articulation habits.",
    targetKeywords: ["ijazah certified quran teacher online", "authentic recitation credentials"]
  }
];