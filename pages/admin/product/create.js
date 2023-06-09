import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import TableKinds from "../../../components/admin/TableKinds";
import AcceptModal from "../../../components/admin/AcceptModal";
import { server } from "../../../config/index";
import authHandler from "../../../shared/utils/auth/authHandler";

function create() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const [allCats, setCats] = useState([]);
  //categories that fetch from DB
  useEffect(async () => {
    if (allCats === undefined) return;
    if (allCats.length === 0) {
      const res = await fetch(`${server}/api/product/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      setCats(data);
    }
  }, [allCats]);

  //states for diffrent kinds of a product diffrent colors sizes and amounts
  const [storeSt, setStoreSt] = useState([
    {
      color: "",
      colorCode: "",
      sizeAmnt: [{ size: "", amount: 0 }],
      imgUrls: [],
    },
  ]);
  // final product
  const [save, setSave] = useState(false);
  const [finalPro, setFinalPro] = useState({});
  // modal state
  const [showModal, setShowModal] = useState(false);

  // fetch data just after click on save  button
  useEffect(async () => {
    if (save) {
      const res = await fetch(`${server}/api/product/crud`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalPro),
      });

      const athorized = res.headers.get("authorized") === "true";
      const data = await res.json();

      if (athorized) {
        if (data._id) {
          alert("product saved successfuly");
          router.back();
        } else {
          alert("couldn't save product");
          console.log(data);
        }
        setSave(false);
      } else {
        router.push("/admin/login");
      }
    }
  }, [save]);

  const submitHandler = (form) => {
    // make a product model to send
    const { name, category, price, description, sale, newArival, available } =
      form;
    const newName = name.replace(/ /g, "_");
    const newProduct = {
      name: newName,
      category,
      price,
      store: storeSt,
      description,
      sale,
      newArival,
      available,
    };
    setFinalPro(newProduct);
  };

  return (
    <div className="bg-primary w-full text-secondary p-6">
      <form
        className="w-[60%] mx-auto flex flex-col"
        onSubmit={handleSubmit(submitHandler)}
      >
        {/* modal for saving new store */}
        <AcceptModal
          showModal={showModal}
          setShowModal={setShowModal}
          setSave={setSave}
        />

        <label className="mt-5 ml-10">name</label>
        <input
          className="w-72 ml-8 bg-hover  mt-2 rounded-full text-secondary pl-3 py-0.5"
          type="text"
          placeholder="product name..."
          {...register("name", {
            required: true,
            pattern:
              /^[^+={}()<>!@#$%^&*?;:,|\\/_.]*[^\s+={}()<>!@#$%^&*?;:,|\\/_.]$/,
          })}
        />
        {errors.name && (
          <p className="text-red-700 ml-10 mt-1">
            {errors.name.type === "required"
              ? "enter the product name"
              : "name should not end with white space or containes any of these +={}()<>!@#$%^&*?;:,|\\._/"}
          </p>
        )}

        <label className="mt-5 ml-10">Category</label>
        <select
          className="w-72 ml-8 bg-hover  mt-2 rounded-full pl-3 py-0.5 text-secondary"
          name="category"
          {...register("category", { required: true })}
        >
          <option value="" selected disabled>
            ----------
          </option>
          {allCats?.map((cat, i) => (
            <option key={i} value={cat}>
              {cat}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-red-700 ml-10">choose the product category</p>
        )}

        <label className="mt-5 ml-10">price</label>
        <input
          className="w-72 ml-8 bg-hover  mt-2 rounded-full text-secondary pl-3 py-0.5"
          type="number"
          placeholder="$"
          {...register("price", { required: true })}
        />
        {errors.price && (
          <p className="ml-10 text-red-700">enter the product price</p>
        )}
        <div className="border-[1px] border-hovercont w-full  px-8 rounded-md my-9 pb-9">
          {storeSt?.map((kind, i) => {
            return (
              <TableKinds
                key={i}
                i={i}
                register={register}
                errors={errors}
                storeSt={storeSt}
                setStoreSt={setStoreSt}
              />
            );
          })}

          {/* adding new kind or delete the last kind */}
          <div className="text-center flex flex-row justify-between">
            <button
              className="w-1/2 mx-auto mt-10 bg-hover rounded-full text-secondary px-auto py-0.5 hover:bg-transparent hover:border-[1px] hover:border-primarycont hover:text-primary"
              onClick={() => {
                setStoreSt([
                  ...storeSt,
                  {
                    color: "",
                    colorCode: "",
                    sizeAmnt: [{ size: "", amount: 0 }],
                    imgUrls: [],
                  },
                ]);
              }}
            >
              add new color
            </button>
            <br />
            {storeSt.length > 1 && (
              <button
                className="w-1/2 ml-1 mt-10 bg-danger rounded-full text-white px-auto py-0.5 hover:bg-transparent hover:border-[1px] hover:border-red-600 hover:text-danger"
                onClick={() => {
                  let tempObj = storeSt;
                  tempObj.pop();
                  setStoreSt(tempObj);
                }}
              >
                delete last color
              </button>
            )}
          </div>
        </div>
        <label className="mt-5  ml-2">description</label>
        <textarea
          className="w-full h-56 bg-hover  mt-2 rounded-md text-secondary pl-3 py-0.5"
          type="text"
          placeholder="product description..."
          {...register("description", { required: true })}
        />
        {errors.description && (
          <p className="text-red-700 ml-10">enter the product description</p>
        )}

        <div className="mt-6">
          <input className="mt-3 mr-2" type="checkbox" {...register("sale")} />
          <label>on sale</label>
        </div>
        <div className="mt-6">
          <input
            className="mt-3 mr-2"
            type="checkbox"
            {...register("newArival")}
          />
          <label>new arival</label>
        </div>
        <div>
          <input
            className="mt-3 mr-2"
            type="checkbox"
            {...register("available")}
            defaultChecked
          />
          <label>is available</label>
        </div>

        <button
          className="w-3/4 mx-auto mt-10 bg-hover rounded-full text-secondary px-auto py-1.5 hover:bg-transparent hover:border-solid hover:border-[1px] hover:border-primarycont hover:text-primary"
          onClick={() => {
            setShowModal(true);
          }}
        >
          submit
        </button>
      </form>
    </div>
  );
}

export default create;

export async function getServerSideProps(context) {
  const { authorized } = await authHandler(context.req, context.res,true);

  if (authorized === true) {
    return {
      props: {}, // will be passed to the page component as props
    };
  } else {
    return {
      redirect: {
        destination: "/admin/login",
        permanent: false,
      },
    };
  }
}
