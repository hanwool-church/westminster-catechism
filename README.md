# 소요리문답 60일

고2 학생들과 함께하는 웨스트민스터 소요리문답 60일 과정 사이트입니다.
하루 한 편, 유튜브 강의를 보고 소요리문답을 읽습니다. 감동 받은 부분은 채팅방에서 나눕니다.

## 폴더 구조

```
index.html            페이지 뼈대 (거의 수정할 일 없음)
assets/style.css      디자인
assets/app.js         화면 동작
data/config.json      ★ 시작일, 채팅방 링크, 일차별 유튜브 링크
data/notes.json       ★ 강의 이야기 글 (회차가 진행될 때마다 추가)
data/catechism.json   소요리문답 107문 본문과 60일 일정 (수정할 일 없음)
.nojekyll             GitHub Pages 설정용 빈 파일
```

평소에는 ★ 표시한 두 파일만 고치면 됩니다.

## 처음 올리기 (GitHub Pages)

1. GitHub에서 새 저장소를 만듭니다. (예: `wsc60`, Public)
2. 이 폴더의 파일을 모두 올립니다. (`.nojekyll` 포함)
3. 저장소 Settings → Pages → Branch를 `main` / `(root)`로 선택하고 Save.
4. 1~2분 뒤 `https://<아이디>.github.io/wsc60/` 주소가 생깁니다.

## 업데이트하기

### 시작일, 채팅방, 유튜브 링크
`data/config.json`을 GitHub 웹에서 열고 연필(Edit) 버튼으로 수정 후 Commit.

```json
"startDate": "2026-11-09",
"chatUrl": "https://open.kakao.com/o/....",
"links": {
  "1": { "url": "https://www.youtube.com/watch?v=...", "title": "제1문 강의" },
```

### 강의 이야기 추가
`data/notes.json` 맨 끝 `]` 앞에 새 항목을 추가합니다. (Claude에게 자막을 주고 요청하면 이 형식으로 받을 수 있습니다.)

- `id`: 영문 소문자, 숫자, 하이픈만 (예: `q1`, `intro`)
- `days`: 연결할 일차 번호 목록 (예: `[1]`). 해당 일차 화면에 "강의 이야기 보기" 버튼이 생깁니다.
- 항목 사이 쉼표(,)를 빠뜨리면 사이트가 열리지 않으니 주의하세요.

수정이 반영되기까지 최대 몇 분 걸릴 수 있습니다.

## 로컬에서 확인

파일을 더블클릭하면 데이터를 불러오지 못합니다. 폴더에서 아래 명령으로 확인하세요.

```
python -m http.server 8000
```
브라우저에서 http://localhost:8000 접속.

## 참고
- 소요리문답 본문은 대한예수교장로회(합동) 교단에서 사용하는 번역을 따랐습니다.
