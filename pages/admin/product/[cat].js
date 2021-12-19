import { server } from "../../../config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import AdminProduts from "../../../components/admin/AdminProduts";

function index({ allProducts, allCategories, query }) {
  const [products, setProducts] = useState(allProducts);
  const [categories, setCategories] = useState(allCategories);
  //pushing query whene category change
  useEffect(async () => {
    const productsData = await fetch(
      `${server}/api/product/crud?cat=${query}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const catsData = await fetch(`${server}/api/product/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const pros = await productsData.json();
    const cats = await catsData.json();
    setCategories(cats);
    setProducts(pros);
  }, [query]);

  const router = useRouter();
  const queryHandler = (cat) => {
    const params = new URLSearchParams();
    params.append("cat", cat);
    router.push({ search: params.toString() });
  };

  return (
    <div className="bg-black py-1 text-gray-100">
      <div className="mx-10 my-8">
        <label className="text-xl">category: </label>
        <select
          className="bg-gray-600 opacity-60 rounded-full px-2"
          name="categories"
          onChange={(e) => {
            queryHandler(e.target.value);
          }}
        >
          {categories.map((cat, i) => (
            <option key={i} value={cat} selected={cat === query ? true : false}>
              {cat}
            </option>
          ))}
        </select>
      </div>
      {products.map((product, i) => {
        return (
          <div className="pb-6" key={i}>
            <AdminProduts product={product} index={i} setProducts={setProducts} products={products} />
          </div>
        );
      })}
    </div>
  );
}

export async function getStaticProps(context) {
  const query = context.params.cat;
  const productsData = await fetch(`${server}/api/product/crud?cat=${query}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const catsData = await fetch(`${server}/api/product/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const allProducts = await productsData.json();
  const allCategories = await catsData.json();

  return {
    props: { allProducts, allCategories, query },
  };
}

export async function getStaticPaths() {
  const catsData = await fetch(`${server}/api/product/categories`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const cats = await catsData.json();

  // Get the paths we want to pre-render based on posts
  const paths = cats.map((cat) => ({
    params: { cat: cat },
  }));
  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: "blocking" };
}
export default index;