const fs = require('fs');

async function testRedirect() {
  const url = 'https://tinyurl.com/yck9c6ye';
  try {
    const res = await fetch(url, { redirect: 'follow' });
    console.log('Final URL:', res.url);
    console.log('Content-Type:', res.headers.get('content-type'));
    console.log('Status:', res.status);
  } catch (err) {
    console.error(err);
  }
}

testRedirect();
