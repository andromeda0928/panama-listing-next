import Head from 'next/head';
import Link from 'next/link';

/* ----------  STATIC PATHS  ---------- */
export async function getStaticPaths() {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
  const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

  const r = await fetch(`${api}?pageSize=100`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  const { records } = await r.json();

  return {
    paths: records.map(rec => ({ params: { id: rec.id } })),
    fallback: 'blocking',
  };
}

/* ----------  STATIC PROPS  ---------- */
export async function getStaticProps({ params }) {
  const { AIRTABLE_API_KEY, AIRTABLE_BASE_ID, AIRTABLE_TABLE_NAME } = process.env;
  const api = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${encodeURIComponent(AIRTABLE_TABLE_NAME)}`;

  const res = await fetch(`${api}/${params.id}`, {
    headers: { Authorization: `Bearer ${AIRTABLE_API_KEY}` },
  });
  if (!res.ok) return { notFound: true };

  return {
    props: { record: await res.json() },
    revalidate: 60,
  };
}

/* ----------  PAGE  ---------- */
export default function Detail({ record }) {
  const f = record?.fields || {};

  /** 1. Normalizar url_img en un array seguro **/
  let filenames = [];
  if (Array.isArray(f.url_img)) {
    filenames = f.url_img.map(s => String(s).trim()).filter(Boolean);
  } else if (typeof f.url_img === 'string') {
    filenames = f.url_img.split(',').map(s => s.trim()).filter(Boolean);
  }

  /** 2. Construir URLs absolutas **/
  const base      = 'https://panama-green.com/wp-content/uploads/wpallimport/files';
  const imageUrls = filenames.map(name => `${base}/${name}`);
  const ogImage   = imageUrls[0] || '';

  /** 3. Link de WhatsApp **/
  const pageUrl   = `https://tu-dominio.com/${record.id}`;
  const shareText = encodeURIComponent(
    `${f.street_name || ''} – $${(f.price_current || 0).toLocaleString()}\n${pageUrl}`,
  );
  const waHref = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <>
      <Head>
        <title>{f.street_name || 'Detalle de Propiedad'}</title>
        <meta name="description" content={f.remarks_es || f.remarks || ''} />
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
          {imageUrls.map(url => (
            <img key={url} src={url} alt={f.street_name} />
          ))}
        </div>

        {/* … resto del contenido y los estilos se mantienen igual … */}

        <a href={waHref} className="btn-share" target="_blank" rel="noopener">
          Compartir por WhatsApp
        </a>
      </main>
    </>
  );
}
