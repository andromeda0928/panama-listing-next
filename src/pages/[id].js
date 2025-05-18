// src/pages/[id].js
import Head from 'next/head';
import Link from 'next/link';

/* --- STATIC PATHS --- */
export async function getStaticPaths() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
  const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

  const r = await fetch(`${api}?pageSize=100`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  const { records } = await r.json();

  return { paths: records.map(r => ({ params: { id: r.id } })), fallback: 'blocking' };
}

/* --- STATIC PROPS --- */
export async function getStaticProps({ params }) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
  const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

  const res = await fetch(`${api}/${params.id}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  if (!res.ok) return { notFound: true };

  return { props: { record: await res.json() }, revalidate: 60 };
}

/* --- PAGE --- */
export default function Detail({ record }) {
  const f = record?.fields || {};

  /* ----------  IMAGES  ---------- */
  const raw = Array.isArray(f.url_img) ? f.url_img.join(',') : (f.url_img || '');
  const filenames = raw.split(',').map(s => s.trim()).filter(Boolean);

  const base      = 'https://panama-green.com/wp-content/uploads/wpallimport/files';
  const imgs      = filenames.map(fn => `${base}/${fn}`);
  const ogImage   = imgs[0] || '';

  /* ----------  SHARE  ---------- */
  const pageUrl   = `https://tu-dominio.com/${record.id}`;
  const waText    = encodeURIComponent(`${f.street_name || ''} – $${(f.price_current || 0).toLocaleString()}\n${pageUrl}`);
  const waHref    = `https://api.whatsapp.com/send?text=${waText}`;

  return (
    <>
      <Head>
        <title>{f.street_name || 'Detalle de Propiedad'}</title>
        <meta name="description"        content={f.remarks_es || f.remarks || ''} />
        <meta property="og:title"       content={f.street_name || ''} />
        <meta property="og:description" content={f.remarks_es || f.remarks || ''} />
        {ogImage && <meta property="og:image" content={ogImage} />}
        <meta property="og:url"         content={pageUrl} />
        <meta name="twitter:card"       content="summary_large_image" />
      </Head>

      <main>
        <Link href="/" className="back-link">← Volver al catálogo</Link>
        <h1>{f.street_name}</h1>

        <div className="gallery">
          {imgs.map(url => <img key={url} src={url} alt={f.street_name} />)}
        </div>

        <section className="info-grid">
          {/* … TODO: tus campos, idénticos a antes … */}
        </section>

        <section className="features">
          {/* … TODO: características … */}
        </section>

        <section className="remarks">
          <h2>Descripción</h2>
          <p>{f.remarks_es || f.remarks || '—'}</p>
        </section>

        <a href={waHref} className="btn-share" target="_blank" rel="noopener">
          Compartir por WhatsApp
        </a>
      </main>

      {/* estilos sin cambiar */}
    </>
  );
}
