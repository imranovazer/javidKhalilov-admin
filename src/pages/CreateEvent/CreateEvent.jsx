import React, { useContext, useEffect, useState } from "react";

import DropFileInput from "../../components/drop-file-input/DropFileInput";
import axiosInstance from "../../axios";
import Select from "@mui/joy/Select";
import Option from "@mui/joy/Option";
import Input from "@mui/joy/Input";
import Textarea from "@mui/joy/Textarea";
import { Button } from "@mui/joy";
import JoditEditor from "jodit-react";
import { AlertContex } from "../../contex/AlertContex";

function CreateEvent() {
  const [alert, setAlert] = useState();
  const [alertType, setAlertType] = useState();
  const [alertContent, setAlertContent] = useState();
  const [select, setSelect] = useState("null");
  const [file, setFile] = useState();
  const [date, setDate] = useState(null);
  const [languages, setLanguages] = useState([]);

  const [locales, setLocales] = useState([
    {
      languageId: 2,
      title: "",
      description: "",
      content: "",
    },
  ]);

  const [categories, setCategories] = useState([]);
  const { displayAlert } = useContext(AlertContex);
  const [activeLocale, setActiveLocale] = useState(locales[0]);

  const saveDataOnLangChange = () => {
    const clonedLocales = [...locales];
    const newLocales = clonedLocales.map((item) => {
      if (activeLocale.languageId === item.languageId) {
        return activeLocale;
      } else {
        return item;
      }
    });
    setLocales(newLocales);
    return newLocales;
  };

  const handleInputChange = (key, value) => {
    const newActiveLocale = { ...activeLocale, [key]: value };
    setActiveLocale(newActiveLocale);
  };

  useEffect(() => {
    const getLanguages = async () => {
      try {
        const res = await axiosInstance.get("/languages");
        setLanguages(res.data.data);
      } catch (error) {
        console.log(error);
      }
    };

    getLanguages();
  }, []);

  const handleSubmit = async () => {
    try {
      const dataToSend = saveDataOnLangChange();

      const finalData = languages.map((language, index) => {
        let isExsist = dataToSend.find(
          (data) => data.languageId == language.id
        );
        if (isExsist) {
          return isExsist;
        } else {
          return { ...dataToSend[0], languageId: language.id };
        }
      });

      const formdata = new FormData();
      finalData.forEach((send, index) => {
        formdata.append(`locales[${index}][languageId]`, send.languageId);
        formdata.append(`locales[${index}][title]`, send.title);
        formdata.append(`locales[${index}][content]`, send.content);
        formdata.append(`locales[${index}][description]`, send.description);
      });
      formdata.append("image", file);
      formdata.append("date", date);
      const res = await axiosInstance.post("/event", formdata, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      displayAlert(true, "Event created successfully");
      setLocales([
        {
          languageId: 2,
          title: "",
          description: "",
          content: "",
        },
      ]);
      setActiveLocale(locales[0]);

      setFile(null);
      setDate(null);
      setCategories([]);

      console.log(res);
    } catch (error) {
      displayAlert(false, "Unable to create event");
    }
  };

  const handleDeleteLang = (event, id) => {
    event.stopPropagation();
    if (locales?.length == 1) {
      return;
    } else {
      const newLocales = locales.filter((e) => e.languageId != id);
      setLocales(newLocales);
    }
  };
  const handleAddLocale = (language) => {
    setLocales((prevState) => {
      if (prevState.some((e) => e.languageId == language)) {
        return prevState;
      } else {
        return [
          ...prevState,
          {
            languageId: language,
            title: "",
            description: "",
            content: "",
          },
        ];
      }
    });
  };

  const handleSetActiveLocale = (locale) => {
    setActiveLocale(locale);
  };
  return (
    <div className="container mx-auto flex flex-col gap-2">
      <div className="rounded-xl shadow-md bg-slate-200 p-3 flex justify-between gap-3">
        <div className="w-1/2">
          <DropFileInput file={file} setFile={setFile} />
        </div>
        <div className="w-1/2 flex flex-col gap-4">
          <Select
            defaultValue="null"
            value={select}
            sx={{ width: "100%" }}
            onChange={(e) => setSelect("null")}
          >
            <Option value="null">Select language to add</Option>
            {languages &&
              languages.map((item) => (
                <Option
                  key={item.id}
                  value={item.id}
                  onClick={() => handleAddLocale(item.id)}
                >
                  {item.name}
                </Option>
              ))}
          </Select>
          <Input type="date" onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>
      <div className="rounded-xl shadow-md bg-slate-200 p-3 flex flex-col gap-4">
        <div className="rounded-lg  bg-slate-100 p-3 flex gap-1">
          {locales &&
            locales.map((locale, index) => (
              <div
                onClick={() => {
                  saveDataOnLangChange();
                  handleSetActiveLocale(locale);
                }}
                key={index}
                className={` ${
                  activeLocale.languageId == locale.languageId
                    ? "bg-slate-200"
                    : "bg-white"
                } hover:bg-slate-200  cursor-pointer flex w-[130px] justify-between content-center p-2  font-bold  rounded-lg  shadow-sm gap-2 items-center`}
              >
                <p> {languages.find((e) => e.id == locale.languageId)?.name}</p>
                <button
                  className=" rounded-full w-5 h-5 text-white bg-red-400  flex items-center justify-center p-1 "
                  onClick={(event) =>
                    handleDeleteLang(event, locale.languageId)
                  }
                >
                  x
                </button>
              </div>
            ))}
        </div>
        <div className="flex flex-col  rounded-xl  bg-slate-100 p-3import gap-3 p-5">
          <Input
            placeholder="Title "
            value={activeLocale.title}
            onChange={(e) => handleInputChange("title", e.target.value)}
          />
          <Textarea
            placeholder="Description "
            value={activeLocale.description}
            onChange={(e) => handleInputChange("description", e.target.value)}
          />
          <JoditEditor
            value={activeLocale.content}
            onBlur={(value) => {
              handleInputChange("content", value);
            }}
          />
          <Button onClick={handleSubmit}>Post</Button>
        </div>
      </div>
    </div>
  );
}

export default CreateEvent;