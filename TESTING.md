# 🧪 Testing Framework

**Three-tier testing approach for demo-ready prototype**

## 🚀 **Smoke Tests** (Run after every code change)

**Purpose:** Catch major breakage immediately  
**Runtime:** ~2 minutes  
**Frequency:** Every code change  

```bash
# Quick run
./scripts/smoke-test.sh

# Or manually
npm run test:smoke
```

**What it tests:**
- App loads without crashing
- Main navigation works
- Core components render
- No JavaScript errors

---

## 🧪 **Automated Tests** (Run on milestones & on-demand)

**Purpose:** Comprehensive workflow testing  
**Runtime:** ~15 minutes  
**Frequency:** Milestones, pre-demo, on-demand  

```bash
# Full automated suite
npm run test:automated

# All tests
npm run test:all
```

**What it tests:**
- Complete schema editor workflow
- DIY zone functionality  
- Save/load sections
- Drag & drop operations
- Live site navigation
- Design system console

---

## 📋 **Manual Checklist** (Pre-demo verification)

**Purpose:** Human verification of demo flow  
**Runtime:** ~25 minutes  
**Frequency:** Before every demo  

```bash
# Open the checklist
open TESTING_CHECKLIST.md
```

**What it covers:**
- All demo-critical features
- User interaction flows  
- Visual verification
- Performance checks

---

## 🛠️ **Setup**

### First Time Setup
```bash
# Install Playwright
npm run test:setup

# Verify installation
npx playwright --version
```

### Running Tests

```bash
# 1. Start dev server (separate terminal)
npm run dev

# 2. Run smoke tests (after every change)
./scripts/smoke-test.sh

# 3. Run automated tests (milestones)
npm run test:automated

# 4. Manual checklist (pre-demo)
# Follow TESTING_CHECKLIST.md
```

---

## 📊 **Test Results**

### Smoke Test Results
- ✅ **Pass:** Safe to continue coding
- ❌ **Fail:** Fix immediately, don't push

### Automated Test Results  
- ✅ **Pass:** Feature complete, ready for demo
- ❌ **Fail:** Investigate and fix before demo

### Manual Checklist Score
- **30/30:** Ready to demo! 🎉
- **28-29:** Proceed with caution  
- **<28:** Delay demo, fix critical issues

---

## 🎯 **Integration with Development**

### After Every Code Change
1. **Code** → **Save**
2. **Run smoke test** → `./scripts/smoke-test.sh`
3. **✅ Pass?** → Continue coding
4. **❌ Fail?** → Fix before continuing

### Before Every Milestone
1. **Run automated tests** → `npm run test:automated`
2. **Review failures** → Fix critical issues
3. **Update TESTING_CHECKLIST.md** if needed

### Before Every Demo
1. **Run manual checklist** → Follow TESTING_CHECKLIST.md
2. **Score 28+ required** for demo confidence
3. **Practice demo flow** with checklist items

---

## 📁 **File Structure**

```
tests/
├── smoke.test.js          # Fast smoke tests
├── automated.test.js      # Comprehensive E2E tests
scripts/
├── smoke-test.sh          # Smoke test runner
playwright.config.js       # Test configuration  
TESTING_CHECKLIST.md      # Manual verification checklist
TESTING.md                # This file
```
