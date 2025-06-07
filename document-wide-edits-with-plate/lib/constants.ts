export const DOCUMENT_TRANSFORMS = [
  {
    key: 'restructure',
    title: 'Restructure',
    prompt: 'restructure this document with clear headings, logical flow, and proper section hierarchy',
    icon: '🔄',
  },
  {
    key: 'summarize',
    title: 'Executive Summary',
    prompt: 'create an executive summary at the top, then restructure the content with key insights highlighted',
    icon: '📋',
  },
  {
    key: 'expand',
    title: 'Expand Details',
    prompt: 'expand details with more detailed explanations, examples, and supporting information',
    icon: '🔍',
  },
  {
    key: 'simplify',
    title: 'Simplify',
    prompt: 'simplify the entire document using simpler language while maintaining all key information',
    icon: '✨',
  },
  {
    key: 'academic',
    title: 'Academic Style',
    prompt: 'transform into academic writing style with proper citations, formal tone, and structured arguments',
    icon: '🎓',
  },
  {
    key: 'business',
    title: 'Business Proposal',
    prompt: 'convert into a business proposal format with executive summary, problem statement, solution, and next steps',
    icon: '💼',
  },
  {
    key: 'tutorial',
    title: 'Tutorial',
    prompt: 'restructure as a tutorial with clear instructions, prerequisites, and examples',
    icon: '📚',
  },
];

export const DEMO_CONTENT = `# The Way of Code: Mastering the Art of Software Engineering

*Inspired by content from [The Way of Code](https://www.thewayofcode.com/)*

## Introduction

In the digital age, software engineering has evolved from a niche technical skill to a fundamental pillar of modern innovation. The Way of Code represents a philosophy that embraces both the technical precision and creative artistry required to build exceptional software.

This comprehensive exploration delves into the principles, practices, and mindset that distinguish great software engineers from the rest. Whether you're a seasoned developer or just beginning your journey, understanding the Way of Code will elevate your craft and transform how you approach software development.

## The Philosophy of Code

### Code as Communication

Great code is not just functional—it's communicative. Every line you write tells a story to future developers, including your future self. The Way of Code emphasizes clarity over cleverness, readability over brevity, and intention over implicit complexity.

Consider these fundamental principles:

- **Express Intent Clearly**: Your code should reveal what you're trying to accomplish, not just how you're accomplishing it
- **Choose Meaningful Names**: Variables, functions, and classes should have names that immediately convey their purpose
- **Embrace Consistency**: Consistent patterns reduce cognitive load and make codebases predictable
- **Document Decisions**: Comments should explain why something was done, not what is being done

### The Balance of Art and Science

Software engineering sits at the unique intersection of logical precision and creative problem-solving. The Way of Code recognizes that while programming languages provide the syntax, the real art lies in architecting solutions that are both technically sound and elegantly designed.

This balance manifests in several key areas:

- **Problem Decomposition**: Breaking complex challenges into manageable, logical components
- **Pattern Recognition**: Identifying recurring problems and applying proven solutions
- **Creative Optimization**: Finding innovative approaches to performance and scalability challenges
- **User-Centric Design**: Balancing technical constraints with user experience requirements

## Core Engineering Principles

### SOLID Foundation

The SOLID principles form the bedrock of maintainable object-oriented design:

1. **Single Responsibility Principle**: Each class should have one reason to change, focusing on a single piece of functionality
2. **Open/Closed Principle**: Software entities should be open for extension but closed for modification
3. **Liskov Substitution Principle**: Objects of a superclass should be replaceable with objects of any of its subclasses
4. **Interface Segregation Principle**: No client should be forced to depend on methods it does not use
5. **Dependency Inversion Principle**: Depend upon abstractions, not concretions

These principles guide architects toward systems that are flexible, maintainable, and robust against changing requirements.

### DRY and KISS Methodologies

Two complementary principles that shape clean code:

**Don't Repeat Yourself (DRY)**: Every piece of knowledge must have a single, unambiguous, authoritative representation within a system. This principle prevents duplication and ensures that changes need to be made in only one place.

**Keep It Simple, Stupid (KISS)**: Simplicity should be a key goal in design, and unnecessary complexity should be avoided. The simplest solution that meets requirements is often the best solution.

## Modern Development Practices

### Test-Driven Development (TDD)

TDD represents a fundamental shift in how we approach software development. Instead of writing tests after implementation, TDD follows a red-green-refactor cycle:

1. **Red**: Write a failing test that defines the desired improvement or new function
2. **Green**: Write the minimal code necessary to make the test pass
3. **Refactor**: Clean up the new code while ensuring all tests continue to pass

This approach leads to better-designed, more reliable software with comprehensive test coverage.

### Continuous Integration and Deployment

Modern software delivery relies on automation and continuous feedback loops:

- **Automated Testing**: Comprehensive test suites that run on every code change
- **Code Quality Gates**: Automated checks for coding standards, security vulnerabilities, and performance regressions
- **Deployment Automation**: Streamlined pipelines that move code from development to production safely and reliably
- **Monitoring and Observability**: Real-time insights into application performance and user behavior

## The Craft of Problem Solving

### Algorithmic Thinking

Effective software engineers develop strong algorithmic thinking skills:

- **Pattern Recognition**: Identifying common problem patterns and their established solutions
- **Complexity Analysis**: Understanding time and space complexity to make informed optimization decisions
- **Data Structure Selection**: Choosing the right data structures for specific use cases
- **Optimization Strategies**: Balancing premature optimization with performance requirements

### Design Patterns and Architecture

Understanding design patterns provides a vocabulary for discussing solutions:

- **Creational Patterns**: Abstract the instantiation process (Factory, Singleton, Builder)
- **Structural Patterns**: Deal with object composition (Adapter, Decorator, Facade)
- **Behavioral Patterns**: Focus on communication between objects (Observer, Strategy, Command)

### System Architecture

Scaling from individual functions to distributed systems requires architectural thinking:

- **Microservices vs. Monoliths**: Understanding when to decompose systems and when to keep them unified
- **API Design**: Creating interfaces that are intuitive, versioned, and scalable
- **Data Architecture**: Designing data flows and storage solutions that support business requirements
- **Performance Considerations**: Building systems that can handle growth in users, data, and complexity

## Technology Mastery

### Language Proficiency

While the Way of Code transcends any specific technology, deep proficiency in your chosen languages is essential:

- **Idiomatic Code**: Writing code that leverages language-specific features effectively
- **Standard Libraries**: Mastering built-in functionality before reaching for external dependencies
- **Ecosystem Understanding**: Knowing the tools, frameworks, and libraries that enhance productivity
- **Performance Characteristics**: Understanding how language implementations affect runtime behavior

### Staying Current

Technology evolves rapidly, making continuous learning essential:

- **Emerging Paradigms**: Functional programming, reactive systems, and cloud-native architectures
- **Tool Evolution**: New development tools, IDEs, and productivity enhancers
- **Industry Trends**: Understanding how broader technology trends affect software development
- **Community Engagement**: Participating in open source, conferences, and professional networks

## Team Collaboration and Leadership

### Code Reviews

Effective code reviews are collaborative learning opportunities:

- **Constructive Feedback**: Focus on the code, not the coder
- **Knowledge Sharing**: Use reviews to spread knowledge and patterns across the team
- **Quality Assurance**: Catch bugs, security issues, and design problems before they reach production
- **Mentorship**: Senior developers can guide junior team members through the review process

### Technical Communication

Great engineers are also great communicators:

- **Documentation**: Write clear, concise documentation that serves actual users
- **Technical Presentations**: Explain complex concepts to both technical and non-technical audiences
- **Design Discussions**: Facilitate productive conversations about architectural decisions
- **Mentoring**: Help others grow their technical skills and understanding

## The Future of Software Engineering

### Artificial Intelligence Integration

AI is transforming software development:

- **Code Generation**: AI-powered tools that can write boilerplate and even complex algorithms
- **Bug Detection**: Machine learning systems that identify potential issues before they become problems
- **Performance Optimization**: AI systems that automatically optimize code for better performance
- **Testing Automation**: Intelligent test generation and maintenance

### Emerging Paradigms

New approaches to software development continue to evolve:

- **Low-Code/No-Code Platforms**: Democratizing software creation for non-technical users
- **Edge Computing**: Bringing computation closer to data sources for better performance
- **Quantum Computing**: Preparing for a fundamentally different computational paradigm
- **Sustainable Software**: Considering environmental impact in software design decisions

## Conclusion

The Way of Code is more than a methodology—it's a mindset that embraces continuous learning, thoughtful design, and collaborative growth. It recognizes that software engineering is both a technical discipline and a creative endeavor.

Great software engineers understand that their primary responsibility is not just to write code that works, but to craft solutions that are maintainable, scalable, and valuable. They balance technical excellence with pragmatic decision-making, always keeping the end user and business objectives in mind.

As you continue your journey in software engineering, remember that mastery comes not from memorizing syntax or frameworks, but from developing the thinking patterns and problem-solving approaches that allow you to tackle any challenge with confidence and creativity.

The Way of Code is ultimately about becoming the kind of engineer who doesn't just build software, but builds software that makes a difference.

---

*This article draws inspiration from the principles and practices shared at [The Way of Code](https://www.thewayofcode.com/), a resource dedicated to elevating the craft of software engineering.*`;

export const API_ENDPOINTS = {
  MORPH: '/api/morph',
  OPENAI: '/api/openai',
} as const;

export const NOTION_SHORTCUTS = {
  HEADING1: 'Shift+Ctrl+1',
  HEADING2: 'Shift+Ctrl+2',
  HEADING3: 'Shift+Ctrl+3',
  BOLD: 'Ctrl+B',
  ITALIC: 'Ctrl+I',
  UNDERLINE: 'Ctrl+U',
  STRIKETHROUGH: 'Shift+Ctrl+S',
} as const; 