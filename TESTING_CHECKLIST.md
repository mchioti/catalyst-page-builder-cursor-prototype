# 🎯 Demo Testing Checklist

**Run this checklist before every demo to ensure no broken features**

## ✅ **Schema Editor** (5 minutes)

- [ ] Click **Schema tab** → Interface loads
- [ ] Click **+ New** → Dropdown appears  
- [ ] Select **Content → Article → ScholarlyArticle** → Form loads
- [ ] Fill **Object Name**: "Demo Article" → Field accepts input
- [ ] Fill **Headline**: "Test Headline" → Field accepts input  
- [ ] Add **tag**: Type "demo" → Click "Add" → Tag appears
- [ ] Click **Save** → Object appears in list
- [ ] **JSON-LD Preview** shows valid JSON → No errors

## ✅ **DIY Zone - HTML Widget** (3 minutes)

- [ ] Click **DIY Zone tab** → HTML Block visible
- [ ] Drag **HTML Block** to canvas → Widget appears
- [ ] Select widget → **Properties panel** shows HTML controls
- [ ] Click **📱 Load Interactive Example** → Content loads
- [ ] Click **Preview Changes** → Navigate to live site
- [ ] **Interactive buttons visible** → "Profile (84)", "General", etc.
- [ ] Click **"Profile (84)"** → Content changes on right side
- [ ] Back to editor → Widget still selectable

## ✅ **Save/Load Sections** (4 minutes)

- [ ] **Add content** → Drag Text + Heading to canvas
- [ ] **Hover section** → Save icon appears
- [ ] Click **save icon** → Modal opens
- [ ] Enter name **"Demo Section"** → Click "Save Section"  
- [ ] Go to **DIY Zone** → "Demo Section" appears in list
- [ ] Click **"Load"** button → Section loads to canvas
- [ ] **Content preserved** → Text + Heading still there
- [ ] **No errors** in console → No "Selected item not found"

## ✅ **Publication Card Variants** (2 minutes)

- [ ] Drag **Publication List** widget to canvas
- [ ] Select widget → **Card Config** options visible
- [ ] Change **card style** → Visual changes immediately  
- [ ] **Preview Changes** → Style persists on live site
- [ ] Cards **render properly** → No broken layouts

## ✅ **Core Page Builder** (3 minutes)

- [ ] **Drag widgets** from library → Drop zones work
- [ ] **Select widget** → Properties panel updates
- [ ] **Edit text/heading** → Changes appear immediately
- [ ] **Delete widget** → Click X button → Widget removes
- [ ] **Move widgets** between sections → Drag & drop works
- [ ] **Undo** (Ctrl+Z) → Action reverses
- [ ] **Auto-save indicator** → Changes persist on refresh

## ✅ **Design System Console** (3 minutes)

- [ ] Click **Design System Console** → Interface loads
- [ ] Click **Create Website** → Wizard opens
- [ ] Select theme → **Preview updates**
- [ ] Click **Website Settings** → Configuration panel opens
- [ ] Click **Template Library** → Templates visible
- [ ] **Navigation works** → No broken links
- [ ] **Back to Page Builder** → Returns correctly

## ✅ **Live Site Navigation** (4 minutes)

- [ ] Click **Mock Live Site** → Homepage loads
- [ ] **Homepage displays** → Wiley Online Library visible
- [ ] **Featured Research** section → Cards display properly
- [ ] Click **Advanced Materials** → Journal page loads
- [ ] Click **Current Issue** → TOC page loads
- [ ] Click **Home** → Returns to homepage
- [ ] Click **Edit Homepage** → Goes to Page Builder
- [ ] **Content sync** → Changes appear on both sides

## ✅ **Critical Integrations** (2 minutes)

- [ ] **Section padding** → Proper spacing between sections
- [ ] **Responsive layout** → Content width constraints work
- [ ] **No console errors** → Clean developer console
- [ ] **No white screens** → All views render
- [ ] **Loading states** → No infinite spinners

---

## 🚨 **If Any Item Fails:**

1. **Note the specific failure**
2. **Check browser console** for errors
3. **Try refresh** → Does it persist?
4. **Try different browser** → Is it browser-specific?
5. **Document steps to reproduce**

## 📊 **Demo Readiness Score:**

- **All ✅ (30/30)** = Ready to demo! 🎉
- **1-2 failures** = Proceed with caution, avoid failed features
- **3+ failures** = Delay demo, fix critical issues first

---

**Total Time: ~25 minutes** | **Run before every demo**
