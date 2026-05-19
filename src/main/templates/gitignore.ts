export const gitignoreTemplates: Record<string, string> = {
  Node: `# Dependencies
node_modules/
bower_components/

# Build output
dist/
build/
out/

# Environment
.env
.env.local
.env.*.local

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
`,

  Python: `# Byte-compiled
__pycache__/
*.py[cod]
*$py.class

# Virtual environments
venv/
.venv/
env/
ENV/

# Distribution
dist/
build/
*.egg-info/
*.egg

# IDE
.vscode/
.idea/
*.swp

# Environment
.env

# OS
.DS_Store
Thumbs.db
`,

  Go: `# Binaries
*.exe
*.exe~
*.dll
*.so
*.dylib

# Test binary
*.test

# Output
/bin/
/vendor/

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
`,

  Java: `# Compiled class files
*.class

# Package files
*.jar
*.war
*.nar
*.ear
*.zip
*.tar.gz
*.rar

# Build
target/
build/
out/
.gradle/

# IDE
.idea/
*.iml
.vscode/
.classpath
.project
.settings/
bin/

# OS
.DS_Store
Thumbs.db
`,

  'C++': `# Compiled Object files
*.o
*.obj

# Executables
*.exe
*.out
*.app

# Libraries
*.lib
*.a
*.la
*.lo
*.so
*.dll
*.dylib

# Build
build/
cmake-build-*/
CMakeFiles/
CMakeCache.txt

# IDE
.vscode/
.idea/
*.swp
.vs/

# OS
.DS_Store
Thumbs.db
`,

  Rust: `# Build output
/target/
**/*.rs.bk

# IDE
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db
`,

  Unity: `# Library
/[Ll]ibrary/
/[Tt]emp/
/[Oo]bj/
/[Bb]uild/
/[Bb]uilds/
/[Ll]ogs/
/[Uu]ser[Ss]ettings/

# Asset meta
*.pidb.meta
*.pdb.meta
*.mdb.meta

# IDE
.vs/
.vscode/

# OS
.DS_Store
Thumbs.db

# Crashlytics
crashlytics-build.properties
`,

  VisualStudio: `## Visual Studio
.vs/
*.suo
*.user
*.userosscache
*.sln.docstates

# Build results
[Dd]ebug/
[Rr]elease/
x64/
x86/
bld/
[Bb]in/
[Oo]bj/
[Ll]og/
[Ll]ogs/

# NuGet
**/[Pp]ackages/*
*.nupkg
project.lock.json

# OS
.DS_Store
Thumbs.db
`,
};

export const gitignoreNames = Object.keys(gitignoreTemplates);
