const path = require('path');
const puppeteer = require('puppeteer');
const fs = require('fs');

const BASE_URL = 'https://tredence.ripplehire.com/candidate/?token=rzuz0vttMaz0VxxVzDiY&source=CAREERSITE';
const TOKEN = 'rzuz0vttMaz0VxxVzDiY';

async function run() {
  console.log("Starting Chrome...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  // Step 1: Load page to establish session, wait for natural page load 
  await page.goto(`${BASE_URL}#list`, { waitUntil: 'networkidle2', timeout: 60000 });
  // Wait for the SPA to fully hydrate
  await new Promise(r => setTimeout(r, 5000));
  console.log("Session established. Fetching all jobs via API...");

  // Step 2: Paginate via XHR (pagesize=10 matches what page uses, multiple pages)
  const allJobs = [];
  let totalCount = 0;
  
  for (let pg = 0; pg < 10; pg++) {
    const params = JSON.stringify({ page: pg, search: "*:*", token: TOKEN, source: "CAREERSITE", pagesize: 10 });
    
    const data = await page.evaluate((p) => {
      return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('POST', '/candidate/candidatejobsearch', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Accept', 'application/json, text/javascript, */*; q=0.01');
        xhr.onload = () => { try { resolve(JSON.parse(xhr.responseText)); } catch(e) { resolve(null); } };
        xhr.onerror = () => resolve(null);
        xhr.send('careerSiteUrlParams=' + encodeURIComponent(p) + '&lang=en');
      });
    }, params);

    if (!data || !data.jobVoList || data.jobVoList.length === 0) {
      console.log(`  Page ${pg}: empty response, stopping.`);
      break;
    }
    
    totalCount = data.totalJobCount || totalCount;
    allJobs.push(...data.jobVoList);
    console.log(`  Page ${pg}: +${data.jobVoList.length} jobs (${allJobs.length}/${totalCount})`);
    
    if (allJobs.length >= totalCount) break;
    await new Promise(r => setTimeout(r, 1000));
  }

  const jobs = allJobs;
  console.log(`\nTotal: ${jobs.length} jobs collected. Fetching details...\n`);

  // Step 3: For each job, NAVIGATE to the detail page to trigger the real candidatejobdetail XHR
  const results = [];
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    const jobSeq = job.jobSeq;
    console.log(`[${i + 1}/${jobs.length}] ${job.jobTitle} (${jobSeq})...`);

    try {
      // Set up response interceptor BEFORE navigating
      const detailPromise = new Promise((resolve) => {
        const handler = async (res) => {
          if (res.url().includes('candidatejobdetail')) {
            try { resolve(await res.json()); } catch(e) { resolve(null); }
            page.off('response', handler);
          }
        };
        page.on('response', handler);
        setTimeout(() => { page.off('response', handler); resolve(null); }, 15000);
      });

      // Navigate to trigger the SPA detail view
      await page.goto(`${BASE_URL}#detail/job/${jobSeq}`, { waitUntil: 'networkidle2', timeout: 20000 });
      const detail = await detailPromise;

      const htmlDesc = detail?.jobVO?.jobDesc || '';
      const plainDesc = htmlDesc
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?(p|div|li|ul|ol|h[1-6]|tr|td|th)[^>]*>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'").replace(/&quot;/g, '"')
        .replace(/\r\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();

      results.push({
        rippleId: jobSeq,
        title: job.jobTitle,
        location: detail?.jobVO?.jobLocation || job.jobLocation || 'Unknown',
        experience: detail?.jobVO?.jobReqExp || job.jobReqExp || '',
        openings: detail?.jobVO?.numOfOpening || job.numOfOpening || '1',
        url: `${BASE_URL}#detail/job/${jobSeq}`,
        description: plainDesc || 'No description available',
      });
      console.log(`  -> OK (${plainDesc.length} chars)`);
    } catch (err) {
      console.log(`  -> FAILED: ${err.message}`);
      results.push({
        rippleId: jobSeq, title: job.jobTitle,
        location: job.jobLocation || 'Unknown', experience: job.jobReqExp || '',
        openings: job.numOfOpening || '1', url: `${BASE_URL}#detail/job/${jobSeq}`,
        description: 'Failed to fetch',
      });
    }
  }

  await browser.close();
  const outputPath = path.resolve(__dirname, 'scraped-jobs.json');
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));
  console.log(`\nDone! Saved ${results.length} jobs to ${outputPath}`);
}

run().catch(console.error);
