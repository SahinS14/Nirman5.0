"use client";

import React, { useState, useRef, useEffect } from "react";
import { Button } from "../ui/button";
import { X, Copy, Check, Code2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { runCode } from "@/utils/runCode";
import dynamic from "next/dynamic";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

interface CodeEditorProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
  isCodingRound?: boolean;
  codingRoundTime?: number;
  codingRoundDuration?: number;
  onEndCodingRound?: () => void;
}

export function CodeEditor({ isOpen, onClose, themeColor, isCodingRound = false, codingRoundTime = 0, codingRoundDuration = 45, onEndCodingRound }: CodeEditorProps) {
  const [code, setCode] = useState<string>(`// Write your solution here
`);
  const [language, setLanguage] = useState<string>("javascript");
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [stdin, setStdin] = useState<string>("");
  const [output, setOutput] = useState<string>("");
  const [running, setRunning] = useState<boolean>(false);
  const [selectedDSA, setSelectedDSA] = useState<string>("twoSum");
  const [theme, setTheme] = useState<"vs-dark"|"light"|"hc-black"|"indigo-dark"|"solarized-light">("vs-dark");

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const remainingTime = (codingRoundDuration * 60) - codingRoundTime;
  const isTimeUp = remainingTime <= 0;

  // Auto-resize textarea (legacy) — not used with Monaco but kept to avoid errors
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [code]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value);
    // Don't load solution templates - user must write from scratch
    setCode(`// Write your solution in ${e.target.value}\n`);
  };

  const onRun = async () => {
    setOutput("");
    setRunning(true);
    try {
      const res = await runCode({ language: language as any, code, stdin, version: "*" });
      setOutput(res.output || "");
    } catch (err: any) {
      const msg = err?.message ? String(err.message) : String(err);
      setOutput(msg);
    } finally {
      setRunning(false);
    }
  };

  // DSA question presets with sample test cases - NO SOLUTION TEMPLATES
  const dsaPresets: Record<string, { title: string; description: string; difficulty: string; samples: { stdin: string; expected?: string }[] }> = {
    twoSum: {
      title: "Two Sum",
      difficulty: "Easy",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.",
      samples: [
        { stdin: "5\n2 7 11 15 1\n9", expected: "0 1" },
        { stdin: "4\n3 2 4 5\n6", expected: "1 2" },
      ],
      templates: {
        javascript: `function twoSum(nums, target){
  const map = new Map();
  for(let i=0;i<nums.length;i++){
    const need = target - nums[i];
    if(map.has(need)) return [map.get(need), i];
    map.set(nums[i], i);
  }
  return [-1, -1];
}
// input format:
// n\nnums...\ntarget
const fs = require('fs');
const data = fs.readFileSync(0,'utf8').trim().split(/\s+/).map(Number);
const n = data[0];
const nums = data.slice(1, 1+n);
const target = data[1+n];
console.log(twoSum(nums, target).join(' '));`,
        python: `def twoSum(nums, target):
    m = {}
    for i,x in enumerate(nums):
        y = target - x
        if y in m:
            return m[y], i
        m[x] = i
    return -1, -1

# input format:
# n\nnums...\ntarget
import sys
data = list(map(int, sys.stdin.read().strip().split()))
n = data[0]
nums = data[1:1+n]
target = data[1+n]
print(*twoSum(nums, target))`,
        cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  ios::sync_with_stdio(false);cin.tie(nullptr);
  int n; if(!(cin>>n)) return 0; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i]; int t;cin>>t;
  unordered_map<int,int> m; for(int i=0;i<n;i++){int need=t-a[i]; if(m.count(need)){ cout<<m[need]<<" "<<i; return 0;} m[a[i]]=i;}
  cout<<-1<<" "<<-1; return 0;
}`,
        java: `import java.io.*; import java.util.*;
public class Main{ public static void main(String[] args) throws Exception{
  BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
  StringTokenizer st=new StringTokenizer(br.readLine()); int n=Integer.parseInt(st.nextToken());
  st=new StringTokenizer(br.readLine()); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=Integer.parseInt(st.nextToken());
  int t=Integer.parseInt(br.readLine()); Map<Integer,Integer> m=new HashMap<>();
  for(int i=0;i<n;i++){ int need=t-a[i]; if(m.containsKey(need)){ System.out.println(m.get(need)+" "+i); return;} m.put(a[i], i);} System.out.println("-1 -1");
}}`,
      },
    },
    validParentheses: {
      title: "Valid Parentheses",
      difficulty: "Easy",
      description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if: Open brackets must be closed by the same type of brackets, and open brackets must be closed in the correct order.",
      samples: [ 
        { stdin: "()[]{}", expected: "true" }, 
        { stdin: "(]", expected: "false" }, 
        { stdin: "({[]})", expected: "true" } 
      ],
      templates: {
        javascript: `function isValid(s){
  const st=[]; const pair={")":"(","]":"[","}":"{"};
  for(const c of s){ if(c in pair){ if(st.pop()!==pair[c]) return false; } else st.push(c); }
  return st.length===0;
}
const fs=require('fs'); const s=fs.readFileSync(0,'utf8').trim(); console.log(isValid(s));`,
        python: `def isValid(s):
    st=[]; pair={')':'(',']':'[','}':'{'}
    for c in s:
        if c in pair:
            if not st or st.pop()!=pair[c]: return False
        else:
            st.append(c)
    return not st
import sys
print(isValid(sys.stdin.read().strip()))`,
        cpp: `#include <bits/stdc++.h>
using namespace std; int main(){ string s; if(!(cin>>s)) return 0; stack<char> st; map<char,char> p={{')','('},{']','['},{'}','{'}}; for(char c:s){ if(p.count(c)){ if(st.empty()||st.top()!=p[c]){ cout<<"false"; return 0;} st.pop(); } else st.push(c);} cout<<(st.empty()?"true":"false"); }`,
        java: `import java.io.*; import java.util.*; public class Main{ public static void main(String[] args) throws Exception{ BufferedReader br=new BufferedReader(new InputStreamReader(System.in)); String s=br.readLine(); Map<Character,Character> p=new HashMap<>(); p.put(')', '('); p.put(']', '['); p.put('}', '{'); Deque<Character> st=new ArrayDeque<>(); for(char c: s.toCharArray()){ if(p.containsKey(c)){ if(st.isEmpty()||st.removeLast()!=p.get(c)){ System.out.println("false"); return;} } else st.addLast(c);} System.out.println(st.isEmpty()?"true":"false"); }}`,
      },
    },
          binarySearch: {
            title: "Binary Search",
            description: "Given sorted array and target, output index or -1.",
            samples: [ { stdin: "5\n1 3 5 7 9\n7" }, { stdin: "4\n2 4 6 8\n3" } ],
            templates: {
        javascript: `function bs(a, t){ let l=0,r=a.length-1; while(l<=r){ const m=(l+r)>>1; if(a[m]===t) return m; if(a[m]<t) l=m+1; else r=m-1; } return -1; }
      const fs=require('fs'); const d=fs.readFileSync(0,'utf8').trim().split(/\s+/).map(Number); const n=d[0]; const a=d.slice(1,1+n); const t=d[1+n]; console.log(bs(a,t));`,
        python: `def bs(a,t):
          l,r=0,len(a)-1
          while l<=r:
        m=(l+r)//2
        if a[m]==t: return m
        if a[m]<t: l=m+1
        else: r=m-1
          return -1
      import sys
      data=list(map(int,sys.stdin.read().strip().split()))
      n=data[0]; a=data[1:1+n]; t=data[1+n]
      print(bs(a,t))`,
        cpp: `#include <bits/stdc++.h>
      using namespace std; int main(){ ios::sync_with_stdio(false);cin.tie(nullptr); int n; if(!(cin>>n)) return 0; vector<int>a(n); for(int i=0;i<n;i++)cin>>a[i]; int t;cin>>t; int l=0,r=n-1; while(l<=r){ int m=(l+r)/2; if(a[m]==t){ cout<<m; return 0;} if(a[m]<t) l=m+1; else r=m-1;} cout<<-1; }`,
        java: `import java.io.*; import java.util.*; public class Main{ public static void main(String[] args) throws Exception{ BufferedReader br=new BufferedReader(new InputStreamReader(System.in)); int n=Integer.parseInt(br.readLine()); StringTokenizer st=new StringTokenizer(br.readLine()); int[] a=new int[n]; for(int i=0;i<n;i++) a[i]=Integer.parseInt(st.nextToken()); int t=Integer.parseInt(br.readLine()); int l=0,r=n-1; while(l<=r){ int m=(l+r)/2; if(a[m]==t){ System.out.println(m); return;} if(a[m]<t) l=m+1; else r=m-1;} System.out.println(-1); }}`,
            }
          },
          mergeIntervals: {
            title: "Merge Intervals",
            description: "Given intervals, merge overlapping intervals.",
            samples: [ { stdin: "4\n1 3\n2 6\n8 10\n15 18" }, { stdin: "3\n1 4\n4 5\n6 7" } ],
            templates: {
        javascript: `function merge(iv){ iv.sort((a,b)=>a[0]-b[0]); const res=[]; for(const v of iv){ if(!res.length||res[res.length-1][1]<v[0]) res.push(v); else res[res.length-1][1]=Math.max(res[res.length-1][1], v[1]); } return res; }
      const fs=require('fs'); const lines=fs.readFileSync(0,'utf8').trim().split(/\n+/); const n=+lines[0]; const iv=[]; for(let i=1;i<=n;i++){ const [l,r]=lines[i].split(/\s+/).map(Number); iv.push([l,r]); } console.log(merge(iv).map(x=>x.join(' ')).join('\n'));`,
        python: `import sys
      lines=sys.stdin.read().strip().splitlines()
      n=int(lines[0]); iv=[list(map(int,lines[i].split())) for i in range(1,n+1)]
      iv.sort(key=lambda x:x[0])
      res=[]
      for v in iv:
          if not res or res[-1][1]<v[0]: res.append(v)
          else: res[-1][1]=max(res[-1][1], v[1])
      print('\n'.join(' '.join(map(str,x)) for x in res))`,
        cpp: `#include <bits/stdc++.h>
      using namespace std; int main(){ ios::sync_with_stdio(false);cin.tie(nullptr); int n; if(!(cin>>n)) return 0; vector<pair<int,int>> v(n); for(int i=0;i<n;i++) cin>>v[i].first>>v[i].second; sort(v.begin(),v.end()); vector<pair<int,int>> res; for(auto &p:v){ if(res.empty()||res.back().second<p.first) res.push_back(p); else res.back().second=max(res.back().second,p.second);} for(auto &p:res) cout<<p.first<<" "<<p.second<<"\n"; }`,
        java: `import java.io.*; import java.util.*; public class Main{ public static void main(String[] args) throws Exception{ BufferedReader br=new BufferedReader(new InputStreamReader(System.in)); int n=Integer.parseInt(br.readLine()); List<int[]> iv=new ArrayList<>(); for(int i=0;i<n;i++){ StringTokenizer st=new StringTokenizer(br.readLine()); iv.add(new int[]{Integer.parseInt(st.nextToken()), Integer.parseInt(st.nextToken())}); } iv.sort(Comparator.comparingInt(a->a[0])); List<int[]> res=new ArrayList<>(); for(int[] v:iv){ if(res.isEmpty()||res.get(res.size()-1)[1]<v[0]) res.add(v); else res.get(res.size()-1)[1]=Math.max(res.get(res.size()-1)[1], v[1]); } StringBuilder sb=new StringBuilder(); for(int[] p:res){ sb.append(p[0]).append(' ').append(p[1]).append('\n'); } System.out.print(sb.toString()); }}`,
            }
          },
          lruCache: {
            title: "LRU Cache",
            description: "Implement LRU cache with get/put operations.",
            samples: [ { stdin: "6\nput 1 1\nput 2 2\nget 1\nput 3 3\nget 2\nget 3" } ],
            templates: {
        javascript: `class LRU{ constructor(cap){ this.cap=cap; this.m=new Map(); }
        get(k){ if(!this.m.has(k)) return -1; const v=this.m.get(k); this.m.delete(k); this.m.set(k,v); return v; }
        put(k,v){ if(this.m.has(k)) this.m.delete(k); this.m.set(k,v); if(this.m.size>this.cap){ const fk=this.m.keys().next().value; this.m.delete(fk);} }
      }
      const fs=require('fs'); const lines=fs.readFileSync(0,'utf8').trim().split(/\n+/); const cap=2; const lru=new LRU(cap); const out=[]; for(let i=0;i<lines.length;i++){ const parts=lines[i].split(' '); if(parts[0]==='put') lru.put(+parts[1], +parts[2]); else out.push(lru.get(+parts[1])); } console.log(out.join('\n'));`,
        python: `from collections import OrderedDict
      class LRU:
          def __init__(self, cap): self.cap=cap; self.m=OrderedDict()
          def get(self,k):
        if k not in self.m: return -1
        v=self.m.pop(k); self.m[k]=v; return v
          def put(self,k,v):
        if k in self.m: self.m.pop(k)
        self.m[k]=v
        if len(self.m)>self.cap: self.m.popitem(last=False)
      import sys
      lines=sys.stdin.read().strip().splitlines()
      lru=LRU(2); out=[]
      for ln in lines:
          p=ln.split()
          if p[0]=='put': lru.put(int(p[1]), int(p[2]))
          else: out.append(str(lru.get(int(p[1]))))
      print('\n'.join(out))`,
        cpp: `#include <bits/stdc++.h>
      using namespace std; struct LRU{ int cap; list<pair<int,int>> dq; unordered_map<int,list<pair<int,int>>::iterator> mp; LRU(int c):cap(c){} int get(int k){ if(!mp.count(k)) return -1; auto it=mp[k]; int v=it->second; dq.erase(it); dq.push_front({k,v}); mp[k]=dq.begin(); return v;} void put(int k,int v){ if(mp.count(k)){ dq.erase(mp[k]); mp.erase(k);} dq.push_front({k,v}); mp[k]=dq.begin(); if((int)dq.size()>cap){ auto it=dq.end(); --it; mp.erase(it->first); dq.pop_back(); } } };
      int main(){ ios::sync_with_stdio(false);cin.tie(nullptr); LRU lru(2); string op; vector<string> out; while(cin>>op){ if(op=="put"){ int k,v; cin>>k>>v; lru.put(k,v);} else { int k; cin>>k; out.push_back(to_string(lru.get(k))); } } for(auto&s:out) cout<<s<<"\n"; }`,
        java: `import java.io.*; import java.util.*; class LRU{ int cap; LinkedHashMap<Integer,Integer> m=new LinkedHashMap<>(16,0.75f,true); LRU(int c){cap=c;} int get(int k){ return m.getOrDefault(k,-1);} void put(int k,int v){ m.put(k,v); if(m.size()>cap){ Iterator<Integer> it=m.keySet().iterator(); it.next(); it.remove(); } } }
      public class Main{ public static void main(String[] args) throws Exception{ BufferedReader br=new BufferedReader(new InputStreamReader(System.in)); LRU lru=new LRU(2); String ln; List<String> out=new ArrayList<>(); while((ln=br.readLine())!=null){ String[] p=ln.split(" "); if(p[0].equals("put")) lru.put(Integer.parseInt(p[1]), Integer.parseInt(p[2])); else out.add(String.valueOf(lru.get(Integer.parseInt(p[1])))); } System.out.print(String.join("\n", out)); }}`,
      }
    },
    longestSubstring: {
      title: "Longest Substring Without Repeating Characters",
      difficulty: "Medium",
      description: "Given a string s, find the length of the longest substring without repeating characters. For example, given 'abcabcbb', the answer is 'abc' with length 3.",
      samples: [
        { stdin: "abcabcbb", expected: "3" },
        { stdin: "bbbbb", expected: "1" },
        { stdin: "pwwkew", expected: "3" }
      ],
      templates: {
        javascript: `function lengthOfLongestSubstring(s) {
  let maxLen = 0, left = 0;
  const map = new Map();
  for (let right = 0; right < s.length; right++) {
    if (map.has(s[right])) {
      left = Math.max(left, map.get(s[right]) + 1);
    }
    map.set(s[right], right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}
const fs = require('fs');
const s = fs.readFileSync(0, 'utf8').trim();
console.log(lengthOfLongestSubstring(s));`,
        python: `def lengthOfLongestSubstring(s):
    max_len, left = 0, 0
    char_map = {}
    for right, c in enumerate(s):
        if c in char_map:
            left = max(left, char_map[c] + 1)
        char_map[c] = right
        max_len = max(max_len, right - left + 1)
    return max_len

import sys
s = sys.stdin.read().strip()
print(lengthOfLongestSubstring(s))`,
        cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  string s; if(!(cin>>s)) return 0;
  int n=s.size(), maxLen=0, left=0;
  unordered_map<char,int> m;
  for(int r=0;r<n;r++){
    if(m.count(s[r])) left=max(left, m[s[r]]+1);
    m[s[r]]=r;
    maxLen=max(maxLen, r-left+1);
  }
  cout<<maxLen;
}`,
        java: `import java.io.*; import java.util.*;
public class Main{
  public static void main(String[] args) throws Exception{
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
    String s=br.readLine();
    Map<Character,Integer> m=new HashMap<>();
    int maxLen=0, left=0;
    for(int r=0;r<s.length();r++){
      char c=s.charAt(r);
      if(m.containsKey(c)) left=Math.max(left, m.get(c)+1);
      m.put(c,r);
      maxLen=Math.max(maxLen, r-left+1);
    }
    System.out.println(maxLen);
  }
}`
      }
    },
    groupAnagrams: {
      title: "Group Anagrams",
      difficulty: "Medium",
      description: "Given an array of strings strs, group the anagrams together. You can return the answer in any order. An Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.",
      samples: [
        { stdin: "6\neat tea tan ate nat bat", expected: "ate eat tea\nnat tan\nbat" },
        { stdin: "1\na", expected: "a" }
      ],
      templates: {
        javascript: `function groupAnagrams(strs) {
  const map = new Map();
  for (const s of strs) {
    const key = s.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  }
  return Array.from(map.values());
}
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf8').trim().split('\\n');
const n = +lines[0];
const strs = lines[1].split(' ');
const result = groupAnagrams(strs);
result.forEach(g => console.log(g.join(' ')));`,
        python: `def groupAnagrams(strs):
    from collections import defaultdict
    anagram_map = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        anagram_map[key].append(s)
    return list(anagram_map.values())

import sys
lines = sys.stdin.read().strip().splitlines()
n = int(lines[0])
strs = lines[1].split()
result = groupAnagrams(strs)
for group in result:
    print(' '.join(group))`,
        cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  int n; if(!(cin>>n)) return 0;
  vector<string> strs(n);
  for(int i=0;i<n;i++) cin>>strs[i];
  map<string, vector<string>> m;
  for(auto &s : strs){
    string key=s; sort(key.begin(),key.end());
    m[key].push_back(s);
  }
  for(auto &p : m){
    for(auto &w : p.second) cout<<w<<" ";
    cout<<"\\n";
  }
}`,
        java: `import java.io.*; import java.util.*;
public class Main{
  public static void main(String[] args) throws Exception{
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
    int n=Integer.parseInt(br.readLine());
    String[] strs=br.readLine().split(" ");
    Map<String, List<String>> map=new HashMap<>();
    for(String s : strs){
      char[] arr=s.toCharArray(); Arrays.sort(arr);
      String key=new String(arr);
      map.putIfAbsent(key, new ArrayList<>());
      map.get(key).add(s);
    }
    for(List<String> g : map.values()){
      System.out.println(String.join(" ", g));
    }
  }
}`
      }
    },
    productExceptSelf: {
      title: "Product of Array Except Self",
      difficulty: "Medium",
      description: "Given an integer array nums, return an array answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. The algorithm must run in O(n) time and without using the division operation.",
      samples: [
        { stdin: "4\n1 2 3 4", expected: "24 12 8 6" },
        { stdin: "5\n-1 1 0 -3 3", expected: "0 0 9 0 0" }
      ],
      templates: {
        javascript: `function productExceptSelf(nums) {
  const n = nums.length, res = new Array(n);
  res[0] = 1;
  for (let i = 1; i < n; i++) res[i] = res[i-1] * nums[i-1];
  let right = 1;
  for (let i = n-1; i >= 0; i--) {
    res[i] *= right;
    right *= nums[i];
  }
  return res;
}
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf8').trim().split('\\n');
const n = +lines[0];
const nums = lines[1].split(' ').map(Number);
console.log(productExceptSelf(nums).join(' '));`,
        python: `def productExceptSelf(nums):
    n = len(nums)
    res = [1] * n
    for i in range(1, n):
        res[i] = res[i-1] * nums[i-1]
    right = 1
    for i in range(n-1, -1, -1):
        res[i] *= right
        right *= nums[i]
    return res

import sys
lines = sys.stdin.read().strip().splitlines()
n = int(lines[0])
nums = list(map(int, lines[1].split()))
print(' '.join(map(str, productExceptSelf(nums))))`,
        cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  int n; if(!(cin>>n)) return 0;
  vector<int> a(n), res(n,1);
  for(int i=0;i<n;i++) cin>>a[i];
  for(int i=1;i<n;i++) res[i]=res[i-1]*a[i-1];
  int right=1;
  for(int i=n-1;i>=0;i--){
    res[i]*=right;
    right*=a[i];
  }
  for(int x:res) cout<<x<<" ";
}`,
        java: `import java.io.*; import java.util.*;
public class Main{
  public static void main(String[] args) throws Exception{
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
    int n=Integer.parseInt(br.readLine());
    StringTokenizer st=new StringTokenizer(br.readLine());
    int[] a=new int[n], res=new int[n];
    for(int i=0;i<n;i++) a[i]=Integer.parseInt(st.nextToken());
    res[0]=1;
    for(int i=1;i<n;i++) res[i]=res[i-1]*a[i-1];
    int right=1;
    for(int i=n-1;i>=0;i--){
      res[i]*=right;
      right*=a[i];
    }
    StringBuilder sb=new StringBuilder();
    for(int x:res) sb.append(x).append(" ");
    System.out.println(sb.toString().trim());
  }
}`
      }
    },
    rotateImage: {
      title: "Rotate Image",
      difficulty: "Medium",
      description: "You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly.",
      samples: [
        { stdin: "3\n1 2 3\n4 5 6\n7 8 9", expected: "7 4 1\n8 5 2\n9 6 3" },
        { stdin: "2\n1 2\n3 4", expected: "3 1\n4 2" }
      ],
      templates: {
        javascript: `function rotate(matrix) {
  const n = matrix.length;
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }
  for (let i = 0; i < n; i++) matrix[i].reverse();
}
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf8').trim().split('\\n');
const n = +lines[0];
const matrix = [];
for (let i = 1; i <= n; i++) {
  matrix.push(lines[i].split(' ').map(Number));
}
rotate(matrix);
matrix.forEach(row => console.log(row.join(' ')));`,
        python: `def rotate(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()

import sys
lines = sys.stdin.read().strip().splitlines()
n = int(lines[0])
matrix = [list(map(int, lines[i].split())) for i in range(1, n+1)]
rotate(matrix)
for row in matrix:
    print(' '.join(map(str, row)))`,
        cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  int n; if(!(cin>>n)) return 0;
  vector<vector<int>> m(n, vector<int>(n));
  for(int i=0;i<n;i++) for(int j=0;j<n;j++) cin>>m[i][j];
  for(int i=0;i<n;i++) for(int j=i;j<n;j++) swap(m[i][j], m[j][i]);
  for(int i=0;i<n;i++) reverse(m[i].begin(), m[i].end());
  for(auto &r:m){ for(int x:r) cout<<x<<" "; cout<<"\\n"; }
}`,
        java: `import java.io.*; import java.util.*;
public class Main{
  public static void main(String[] args) throws Exception{
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
    int n=Integer.parseInt(br.readLine());
    int[][] m=new int[n][n];
    for(int i=0;i<n;i++){
      StringTokenizer st=new StringTokenizer(br.readLine());
      for(int j=0;j<n;j++) m[i][j]=Integer.parseInt(st.nextToken());
    }
    for(int i=0;i<n;i++) for(int j=i;j<n;j++){ int t=m[i][j]; m[i][j]=m[j][i]; m[j][i]=t; }
    for(int i=0;i<n;i++){ for(int l=0,r=n-1;l<r;l++,r--){ int t=m[i][l]; m[i][l]=m[i][r]; m[i][r]=t; } }
    for(int[] row:m){ for(int x:row) System.out.print(x+" "); System.out.println(); }
  }
}`
      }
    },
    coinChange: {
      title: "Coin Change",
      difficulty: "Medium",
      description: "You are given an integer array coins representing coins of different denominations and an integer amount representing a total amount of money. Return the fewest number of coins that you need to make up that amount. If that amount cannot be made up by any combination, return -1.",
      samples: [
        { stdin: "3\n1 2 5\n11", expected: "3" },
        { stdin: "1\n2\n3", expected: "-1" },
        { stdin: "4\n1 3 4 5\n7", expected: "2" }
      ],
      templates: {
        javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (const coin of coins) {
    for (let i = coin; i <= amount; i++) {
      dp[i] = Math.min(dp[i], dp[i - coin] + 1);
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}
const fs = require('fs');
const lines = fs.readFileSync(0, 'utf8').trim().split('\\n');
const n = +lines[0];
const coins = lines[1].split(' ').map(Number);
const amount = +lines[2];
console.log(coinChange(coins, amount));`,
        python: `def coinChange(coins, amount):
    dp = [float('inf')] * (amount + 1)
    dp[0] = 0
    for coin in coins:
        for i in range(coin, amount + 1):
            dp[i] = min(dp[i], dp[i - coin] + 1)
    return dp[amount] if dp[amount] != float('inf') else -1

import sys
lines = sys.stdin.read().strip().splitlines()
n = int(lines[0])
coins = list(map(int, lines[1].split()))
amount = int(lines[2])
print(coinChange(coins, amount))`,
        cpp: `#include <bits/stdc++.h>
using namespace std;
int main(){
  int n; if(!(cin>>n)) return 0;
  vector<int> coins(n); for(int i=0;i<n;i++) cin>>coins[i];
  int amt; cin>>amt;
  vector<int> dp(amt+1, 1e9);
  dp[0]=0;
  for(int c:coins) for(int i=c;i<=amt;i++) dp[i]=min(dp[i], dp[i-c]+1);
  cout<<(dp[amt]==1e9?-1:dp[amt]);
}`,
        java: `import java.io.*; import java.util.*;
public class Main{
  public static void main(String[] args) throws Exception{
    BufferedReader br=new BufferedReader(new InputStreamReader(System.in));
    int n=Integer.parseInt(br.readLine());
    StringTokenizer st=new StringTokenizer(br.readLine());
    int[] coins=new int[n];
    for(int i=0;i<n;i++) coins[i]=Integer.parseInt(st.nextToken());
    int amt=Integer.parseInt(br.readLine());
    int[] dp=new int[amt+1];
    Arrays.fill(dp, Integer.MAX_VALUE);
    dp[0]=0;
    for(int c:coins) for(int i=c;i<=amt;i++) if(dp[i-c]!=Integer.MAX_VALUE) dp[i]=Math.min(dp[i], dp[i-c]+1);
    System.out.println(dp[amt]==Integer.MAX_VALUE?-1:dp[amt]);
  }
}`
      }
    },
  };  useEffect(() => {
    const preset = dsaPresets[selectedDSA];
    if (!preset) return;
    const tmpl = preset.templates[language] || preset.templates["javascript"];
    setCode(tmpl);
    setStdin(preset.samples[0]?.stdin || "");
  }, [selectedDSA, language]);

  const currentProblem = dsaPresets[selectedDSA];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-[98vw] h-[95vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" style={{ color: themeColor }} />
              <span className="text-lg font-bold">Coding Challenge</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <select
                value={selectedDSA}
                onChange={(e) => setSelectedDSA(e.target.value)}
                className="px-3 py-1.5 border rounded-md text-sm bg-white font-medium"
              >
                <option value="twoSum">Two Sum</option>
                  <option value="validParentheses">Valid Parentheses</option>
                  <option value="binarySearch">Binary Search</option>
                  <option value="longestSubstring">Longest Substring Without Repeating</option>
                  <option value="groupAnagrams">Group Anagrams</option>
                  <option value="productExceptSelf">Product of Array Except Self</option>
                  <option value="mergeIntervals">Merge Intervals</option>
                  <option value="rotateImage">Rotate Image</option>
                  <option value="coinChange">Coin Change</option>
                  <option value="lruCache">LRU Cache</option>
              </select>
              <select
                value={language}
                onChange={handleLanguageChange}
                className="px-3 py-1.5 border rounded-md text-sm bg-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="typescript">TypeScript</option>
                <option value="python">Python</option>
                <option value="java">Java</option>
                <option value="cpp">C++</option>
              </select>
              <select
                value={theme}
                onChange={(e)=>setTheme(e.target.value as any)}
                className="px-3 py-1.5 border rounded-md text-sm bg-white"
              >
                <option value="vs-dark">Dark</option>
                <option value="light">Light</option>
                <option value="hc-black">High Contrast</option>
              </select>
              <Button
                onClick={handleCopy}
                variant="outline"
                size="sm"
                className="gap-1"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    Copy
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden">
          <div className="grid grid-cols-[40%_60%] h-full">
            {/* Left Panel: Problem Statement */}
            <div className="border-r bg-white overflow-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2">{currentProblem?.title}</h2>
                <div className={`mb-4 px-3 py-1 rounded inline-block text-sm font-medium ${
                  currentProblem?.difficulty === 'Easy' 
                    ? 'bg-green-50 text-green-700 border border-green-200' 
                    : currentProblem?.difficulty === 'Medium'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {currentProblem?.difficulty || 'Easy'}
                </div>
                
                <div className="mt-4">
                  <h3 className="text-lg font-semibold mb-2">Problem Statement</h3>
                  <p className="text-gray-700 leading-relaxed">{currentProblem?.description}</p>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3">Example Test Cases</h3>
                  {currentProblem?.samples.map((sample, idx) => (
                    <div key={idx} className="mb-4 bg-gray-50 rounded-lg p-4 border">
                      <div className="font-semibold text-sm mb-2">Example {idx + 1}</div>
                      <div className="space-y-2">
                        <div>
                          <span className="text-xs font-semibold text-gray-600">Input:</span>
                          <pre className="mt-1 bg-white border rounded p-2 text-xs font-mono overflow-x-auto">
{sample.stdin}
                          </pre>
                        </div>
                        {sample.expected && (
                          <div>
                            <span className="text-xs font-semibold text-gray-600">Expected Output:</span>
                            <pre className="mt-1 bg-white border rounded p-2 text-xs font-mono overflow-x-auto">
{sample.expected}
                            </pre>
                          </div>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 text-xs"
                        onClick={() => setStdin(sample.stdin)}
                      >
                        Load Input
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel: Editor + Console */}
            <div className="flex flex-col bg-gray-50">
              {/* Code Editor */}
              <div className="flex-1 min-h-0 border-b">
                <div className="h-full">
                  <MonacoEditor
                    height="100%"
                    language={language === "cpp" ? "cpp" : language}
                    theme={theme}
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{
                      fontSize: 14,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      tabSize: 2,
                      insertSpaces: true,
                      autoClosingBrackets: "always",
                      autoIndent: "full",
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </div>

              {/* Bottom Section: Input + Output */}
              <div className="h-[280px] border-t bg-white pointer-events-auto relative z-[9999]">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-100 border-b">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold">Console</span>
                  </div>
                  <div
                    className="relative z-50 pointer-events-auto"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white h-9 px-6 font-semibold"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRun();
                      }}
                      disabled={running}
                    >
                      {running ? "⏳ Running..." : "▶ Run Code"}
                    </Button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 p-3 h-[calc(100%-48px)]">
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Input (stdin)</label>
                    <textarea
                      value={stdin}
                      onChange={(e) => setStdin(e.target.value)}
                      className="flex-1 p-2 font-mono text-sm border rounded bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter input here..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="text-xs font-semibold text-gray-600 mb-1">Output</label>
                    <div className="flex-1 p-2 font-mono text-sm border rounded bg-black text-green-300 overflow-auto">
                      <pre className="whitespace-pre-wrap break-words text-sm">
                        {running ? "⏳ Executing..." : output || "Output will appear here after running the code."}
                      </pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-3 border-t bg-gray-50 flex items-center justify-between text-xs text-gray-600">
          <span>Real-time collaborative coding environment</span>
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Session
          </span>
        </div>
      </DialogContent>
    </Dialog>
  );
}
