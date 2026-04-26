# 우분투 서버 배포 가이드

Next.js 단일 프로세스가 프론트엔드 렌더링과 서버 로직(Server Actions)을 모두 처리합니다.
**Next.js 앱 1개 + PostgreSQL(Docker)** 구성으로 포트 하나만 열면 됩니다.

## 사전 조건

- Ubuntu 22.04 이상
- Node.js 20 이상
- Git
- PostgreSQL — Docker로 이미 실행 중

---

## 1. Node.js 설치

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v   # v20.x.x 확인
```

---

## 2. 프로젝트 클론 및 설치

```bash
cd /srv
sudo git clone https://github.com/kongsungeui/my-subscription.git
sudo chown -R $USER:$USER my-subscription
cd my-subscription
npm install
```

---

## 3. 환경 변수 설정

```bash
nano .env.local
```

`.env.local` 내용:

```env
# Docker로 실행 중인 PostgreSQL 접속 정보
# 형식: postgresql://<유저>:<비밀번호>@<호스트>:<포트>/<DB명>
DATABASE_URL="postgresql://myapp:myapp@localhost:5432/my_subscription"

# 앱 포트 (기본값 3000)
PORT=8001
```

| 변수 | 설명 |
|------|------|
| `DATABASE_URL` | 운영 중인 PostgreSQL 접속 정보로 수정 |
| `PORT` | Next.js 앱이 수신할 포트 |

> **로그인 계정 변경** — 아이디/비밀번호는 [src/lib/auth.ts](src/lib/auth.ts)의 `ADMIN_USERNAME`, `ADMIN_PASSWORD`를 직접 수정하세요.

---

## 4. DB 마이그레이션

```bash
npx prisma migrate deploy
```

---

## 5. 프로덕션 빌드

```bash
npm run build
```

---

## 6. PM2로 실행 (자동 재시작)

```bash
sudo npm install -g pm2
pm2 start npm --name "my-subscription" -- start
pm2 save
pm2 startup   # 출력된 명령어를 그대로 복사해서 실행
```

### PM2 주요 명령어

| 명령어 | 설명 |
|--------|------|
| `pm2 status` | 실행 중인 앱 목록 |
| `pm2 logs my-subscription` | 실시간 로그 |
| `pm2 restart my-subscription` | 재시작 |
| `pm2 stop my-subscription` | 중지 |

---

## 7. 접속 확인

```bash
curl http://localhost:8001
```

같은 네트워크의 다른 기기에서:

```
http://<서버-IP>:8001
```

서버 IP 확인: `ip addr show | grep "inet "`

---

## 8. 방화벽 설정 (선택)

같은 네트워크 외부에서 접근이 필요한 경우:

```bash
sudo ufw allow 8001/tcp
sudo ufw enable
```

---

## 업데이트 배포

```bash
cd /srv/my-subscription
git pull
npm install
npx prisma migrate deploy   # 스키마 변경이 없으면 생략
npm run build
pm2 restart my-subscription
```
