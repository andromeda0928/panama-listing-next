// pages/index.js
import Head from 'next/head';
import Link from 'next/link';

export async function getStaticProps() {
  const API_KEY    = process.env.AIRTABLE_API_KEY;
  const BASE_ID    = process.env.AIRTABLE_BASE_ID;
  const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;
  const API_URL    = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

  const res = await fetch(`${API_URL}?pageSize=100`, {
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      'Content-Type':  'application/json',
    },
  });
  if (!res.ok) {
    console.error('Airtable error', res.status, res.statusText);
    return { props: { properties: [] } };
  }

  const { records } = await res.json();
  const properties = records.map(r => {
    const f = r.fields;
    return {
      id:            r.id,
      street_name:   f.street_name,
      map_area:      f.map_area,
      property_type: f.property_type,
      price_current: f.price_current,
      // urlImgs siempre array aunque f.url_img sea undefined
      urlImgs: Array.isArray(f.url_img)
        ? f.url_img.map(s => s.trim())
        : (f.url_img ? f.url_img.split(',').map(s => s.trim()) : []),
    };
  });

  return {
    props: { properties },
    revalidate: 60,
  };
}

export default function Catalog({ properties }) {
  return (
    <>
      <Head>
        <title>Catálogo de Propiedades</title>
        <meta name="description" content="Listado de propiedades MLS Panamá" />
      </Head>

      <main>
        <h1>Catálogo de Propiedades</h1>
        <ul className="grid">
          {properties.map(p => {
            const thumb = p.urlImgs[0]
              ? `https://panama-green.com/wp-content/uploads/wpallimport/files/${p.urlImgs[0]}`
              : null;
            return (
              <li key={p.id}>
                <Link href={`/${p.id}`} className="card">
                  {thumb
                    ? <img src={thumb} alt={p.street_name} className="thumb" />
                    : <div className="thumb-placeholder">Sin imagen</div>
                  }
                  <div className="card-body">
                    <h2>{p.street_name}</h2>
                    <p className="location">{p.map_area}</p>
                    <p className="type">{p.property_type}</p>
                    <p className="price">
                      ${p.price_current?.toLocaleString()}
                    </p>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>

      <style jsx>{`
        main {
          padding: 1rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        h1 {
          text-align: center;
          margin-bottom: 1.5rem;
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1rem;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .card {
          display: flex;
          flex-direction: column;
          background: #fff;
          border-radius: 8px;
          overflow: hidden;
          text-decoration: none;
          color: inherit;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }
        .card:hover {
          transform: translateY(-4px);
        }
        .thumb {
          width: 100%;
          height: 160px;
          object-fit: cover;
        }
        .thumb-placeholder {
          width: 100%;
          height: 160px;
          background: #eee;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #999;
        }
        .card-body {
          padding: 1rem;
          display: flex;
          flex-direction: column;
          flex: 1;
        }
        .location, .type {
          margin: 0;
          margin-bottom: 0.5rem;
          color: #666;
          font-size: 0.9rem;
        }
        .price {
          margin-top: auto;
          font-weight: bold;
          color: #2a9d8f;
        }
      `}</style>
    </>
  );
}
