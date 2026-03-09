import { db } from "./db";
import { users, articles, tags, articleTags, claps, comments } from "@shared/schema";
import { eq } from "drizzle-orm";
import { createHash, randomBytes } from "crypto";

function createPasswordHash(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = createHash("sha512").update(password + salt).digest("hex");
  return `${salt}:${hash}`;
}

export async function seedDatabase() {
  const [existingUser] = await db.select().from(users).limit(1);
  if (existingUser) {
    return;
  }

  console.log("Seeding database...");

  const [alice] = await db.insert(users).values({
    username: "alice",
    password: createPasswordHash("password123"),
    displayName: "Alice Chen",
    bio: "Software engineer and tech writer. Passionate about building products that matter. Previously at Google and Stripe.",
  }).returning();

  const [bob] = await db.insert(users).values({
    username: "bob",
    password: createPasswordHash("password123"),
    displayName: "Bob Martinez",
    bio: "UX designer and writer. I explore the intersection of design, technology, and human behavior.",
  }).returning();

  const [carol] = await db.insert(users).values({
    username: "carol",
    password: createPasswordHash("password123"),
    displayName: "Carol Williams",
    bio: "Data scientist and storyteller. Translating complex ideas into accessible narratives.",
  }).returning();

  const [dave] = await db.insert(users).values({
    username: "dave",
    password: createPasswordHash("password123"),
    displayName: "David Park",
    bio: "Startup founder and product thinker. Writing about entrepreneurship and leadership.",
  }).returning();

  const tagNames = ["technology", "programming", "design", "startup", "ai", "productivity", "career", "javascript", "data-science", "leadership"];
  const createdTags: { id: string; name: string }[] = [];
  for (const name of tagNames) {
    const [tag] = await db.insert(tags).values({ name }).returning();
    createdTags.push(tag);
  }

  const articlesData = [
    {
      title: "The Art of Writing Clean Code",
      subtitle: "Why readability matters more than cleverness",
      content: `Every developer has been there. You open a file, and the code reads like a puzzle. Variable names like x, y, and temp scattered everywhere. Functions stretching hundreds of lines. Comments that say "don't touch this" without explaining why.

Clean code isn't about following rigid rules. It's about empathy. When you write code, you're writing for the next person who will read it \u2014 and that person might be you in six months.

Here are the principles I've learned after a decade of software engineering:

Name things well. A variable called userAuthenticationToken is better than token. A function called calculateMonthlyRevenue is better than calc. Yes, longer names mean more typing. But reading happens far more often than writing.

Keep functions small. If a function does more than one thing, split it up. Each function should tell a clear story. When you read it, you should understand what it does without diving into implementation details.

Avoid deep nesting. If your code has more than three levels of indentation, something's wrong. Extract helper functions. Use early returns. Flatten your logic.

Write tests. Not because someone told you to, but because tests are documentation. They show how your code is meant to be used. They catch regressions before they reach production.

The best code I've ever read felt like prose. It flowed naturally from one idea to the next. That's what we should all aspire to.`,
      coverImage: "",
      authorId: alice.id,
      published: true,
      tagIndices: [0, 1, 7],
    },
    {
      title: "Why Every Designer Should Learn to Code",
      subtitle: "Bridging the gap between design and development",
      content: `When I started my career as a UX designer, I thought coding was for engineers. My job was to make things look beautiful and feel intuitive. Their job was to build it.

I was wrong.

Learning to code didn't make me a worse designer. It made me a dramatically better one. Here's why.

Understanding constraints unlocks creativity. When you know what's possible (and what's expensive), you make better design decisions. That animation you sketched might take five minutes or five days to implement. Knowing the difference changes your approach entirely.

You speak the same language. Design reviews become collaborative instead of adversarial. Instead of saying "make it pop," you can say "let's try a subtle box-shadow with a color shift on hover." Engineers respect that.

Prototyping becomes real. Instead of static mockups, you can build interactive prototypes in code. They're more convincing, more testable, and often become the starting point for production code.

You see the whole picture. Design doesn't end at the Figma canvas. It includes loading states, error messages, empty states, and edge cases that only become apparent when you're building the real thing.

I'm not saying every designer needs to become a full-stack developer. But understanding HTML, CSS, and basic JavaScript will transform how you think about design.`,
      coverImage: "",
      authorId: bob.id,
      published: true,
      tagIndices: [2, 0, 1],
    },
    {
      title: "A Beginner's Guide to Machine Learning",
      subtitle: "Demystifying AI for the curious mind",
      content: `Machine learning sounds intimidating. Neural networks, gradient descent, backpropagation \u2014 the terminology alone can scare people away. But the core ideas are surprisingly intuitive.

At its heart, machine learning is about pattern recognition. You show a computer thousands of examples, and it learns to make predictions about new data it hasn't seen before.

Think of it like teaching a child to recognize cats. You don't explain the mathematical properties of cat-ness. You show them pictures. "This is a cat. This is not a cat." Eventually, they get it. Machine learning works the same way.

There are three main types:

Supervised learning is like studying with answer keys. You give the algorithm input-output pairs, and it learns the relationship. Want to predict house prices? Show it thousands of houses with their features (size, location, age) and their prices. It learns the pattern.

Unsupervised learning is like organizing without instructions. The algorithm looks for structure in data without being told what to find. Customer segmentation is a classic example \u2014 grouping customers by behavior without predefined categories.

Reinforcement learning is like training through trial and error. An agent takes actions in an environment and receives rewards or penalties. Over time, it learns optimal strategies. This is how AlphaGo learned to play Go.

The tools have never been more accessible. Python, scikit-learn, and TensorFlow put these capabilities in anyone's hands. You don't need a PhD to get started.

Start with a simple project. Predict something that interests you. The learning curve is steep at first, but the view from the top is worth it.`,
      coverImage: "",
      authorId: carol.id,
      published: true,
      tagIndices: [4, 0, 8],
    },
    {
      title: "Lessons From Building My First Startup",
      subtitle: "What I wish someone had told me before I started",
      content: `Three years ago, I left a comfortable job at a big tech company to start my own thing. I had savings, a co-founder, and what I thought was a brilliant idea. Here's what I learned.

Your first idea is probably wrong. We spent six months building a product nobody wanted. The breakthrough came when we stopped building and started talking to users. Real conversations, not surveys. Sit down with people, watch them struggle with their current solutions, and listen.

Speed matters more than perfection. Our first launch was embarrassing. The design was rough, the features were minimal, and we had bugs. But it was out there. Real users found real value in it, and their feedback shaped everything that followed.

Hiring is the hardest thing you'll do. Your first five hires define your culture. We made the mistake of hiring for skills alone. Technical brilliance without cultural alignment creates more problems than it solves.

Revenue is the best validation. We spent too long chasing metrics like user growth and engagement. The day our first customer paid us \u2014 actually exchanged money for our product \u2014 was the day I knew we had something real.

Take care of yourself. I burned out hard in year two. I stopped exercising, ate poorly, and worked weekends. My productivity dropped. My decision-making suffered. The company suffered. Taking a real vacation was the most productive thing I did that year.

Building a startup is the hardest and most rewarding thing I've ever done. If you're thinking about it, start talking to customers today. Don't wait for the perfect idea.`,
      coverImage: "",
      authorId: dave.id,
      published: true,
      tagIndices: [3, 9, 6],
    },
    {
      title: "The Future of JavaScript in 2026",
      subtitle: "What's next for the world's most popular programming language",
      content: `JavaScript has come a long way from its humble beginnings as a scripting language for web browsers. In 2026, it's the backbone of modern web development, powering everything from frontend interfaces to backend services, mobile apps, and even machine learning models.

Here's what's exciting about JavaScript right now.

The runtime wars are heating up. Node.js is no longer the only game in town. Deno and Bun have introduced fresh ideas about security, performance, and developer experience. Competition drives innovation, and developers are the winners.

TypeScript has won. The debate is over. TypeScript's type system catches bugs before they reach production, improves IDE support, and makes codebases more maintainable. If you're starting a new project in 2026 without TypeScript, you need a good reason.

AI-assisted development is changing how we code. Tools that understand JavaScript's ecosystem can generate boilerplate, suggest patterns, and even write tests. But they haven't replaced the need to understand fundamentals. If anything, AI makes strong fundamentals more important, not less.

Web standards keep improving. Newer CSS features, native form validation, and built-in components reduce our dependency on libraries. The platform itself is becoming more capable, which means simpler dependency trees.

Server components and streaming are reshaping architecture. The line between server and client is blurring in productive ways. We're moving toward architectures that deliver better user experiences with less JavaScript shipped to the browser.

The JavaScript ecosystem can be overwhelming. There's a new framework or tool every week. My advice: master the fundamentals. Closures, async/await, the event loop, prototypes. Everything else builds on these.`,
      coverImage: "",
      authorId: alice.id,
      published: true,
      tagIndices: [0, 1, 7],
    },
    {
      title: "Designing for Accessibility: Beyond Compliance",
      subtitle: "How inclusive design makes products better for everyone",
      content: `When most people hear "accessibility," they think of legal compliance. Screen readers, alt text, WCAG guidelines. These are important, but they're just the beginning.

Truly accessible design is about creating products that work for the widest possible range of human abilities and situations. And here's the secret: designing for edge cases makes your product better for everyone.

Consider curb cuts \u2014 those small ramps at street corners. They were designed for wheelchair users. But they also help people with strollers, delivery workers with carts, travelers with luggage, and runners. That's the curb cut effect. Accessibility features become universal improvements.

In digital products, this plays out constantly. Captions help deaf users, but they also help people watching videos in noisy environments or in quiet offices. High contrast helps visually impaired users, but it also helps everyone reading in bright sunlight.

Here's how to build accessibility into your design process:

Start with content structure. If your content makes sense when read linearly, it will work with screen readers. Use proper heading hierarchy, descriptive link text, and logical tab order.

Design for keyboard navigation. Many users can't use a mouse. Every interactive element should be reachable and operable with a keyboard. Focus indicators should be visible and clear.

Use sufficient color contrast. WCAG recommends a minimum contrast ratio of 4.5:1 for normal text. But don't stop there. Consider color blindness. Never use color alone to convey information.

Test with real users. Automated tools catch about 30% of accessibility issues. The rest requires human testing. Include disabled users in your research process.

Accessible design isn't a feature. It's a quality indicator. The best products are the ones that work for everyone.`,
      coverImage: "",
      authorId: bob.id,
      published: true,
      tagIndices: [2, 0, 5],
    },
  ];

  for (const articleData of articlesData) {
    const { tagIndices, ...data } = articleData;
    const readTime = Math.max(1, Math.ceil(data.content.trim().split(/\s+/).length / 200));
    const [article] = await db.insert(articles).values({
      ...data,
      readTime,
    }).returning();

    for (const idx of tagIndices) {
      await db.insert(articleTags).values({
        articleId: article.id,
        tagId: createdTags[idx].id,
      });
    }
  }

  const allArticles = await db.select().from(articles);

  await db.insert(claps).values({ articleId: allArticles[0].id, userId: bob.id, count: 1 });
  await db.insert(claps).values({ articleId: allArticles[0].id, userId: carol.id, count: 1 });
  await db.insert(claps).values({ articleId: allArticles[1].id, userId: alice.id, count: 1 });
  await db.insert(claps).values({ articleId: allArticles[2].id, userId: dave.id, count: 1 });
  await db.insert(claps).values({ articleId: allArticles[3].id, userId: alice.id, count: 1 });
  await db.insert(claps).values({ articleId: allArticles[3].id, userId: bob.id, count: 1 });
  await db.insert(claps).values({ articleId: allArticles[4].id, userId: carol.id, count: 1 });

  await db.insert(comments).values({ articleId: allArticles[0].id, authorId: bob.id, content: "Great article! Clean code is something every developer should prioritize from day one." });
  await db.insert(comments).values({ articleId: allArticles[0].id, authorId: carol.id, content: "The point about naming things well really resonates. I've seen so many codebases where poor naming makes everything harder." });
  await db.insert(comments).values({ articleId: allArticles[1].id, authorId: alice.id, content: "As an engineer, I love working with designers who understand code constraints. It makes collaboration so much smoother." });
  await db.insert(comments).values({ articleId: allArticles[2].id, authorId: dave.id, content: "This is the clearest explanation of ML types I've read. Perfect for sharing with non-technical colleagues." });
  await db.insert(comments).values({ articleId: allArticles[3].id, authorId: carol.id, content: "The part about revenue being the best validation is spot on. Vanity metrics can be misleading." });

  console.log("Database seeded successfully!");
}
