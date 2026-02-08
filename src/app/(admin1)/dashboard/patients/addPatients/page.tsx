'use client'
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import illnesses from "../../../../../../public/multiOptions/illnesses.json";
import dynamic from "next/dynamic";
import TeethSelector from "@/components/ui/teeth/teethSelector";
import {  Typography, Box } from "@mui/material";
import FileUpload from "react-material-file-upload";
import Select from "@/components/form/Select";

const PageBreadcrumb = dynamic(() => import("@/components/ui/common/PageBreadCrumb"));
const DatePicker = dynamic(() => import("@/components/form/date-picker"));
const Label = dynamic(() => import("@/components/form/Label"));
const Input = dynamic(() => import("@/components/form/input/InputField"));
const MultiSelect = dynamic(() => import("@/components/form/MultiSelect"));
const ComponentCard = dynamic(() => import("@/components/ui/common/ComponentCard"));
const Button = dynamic(() => import("@/components/ui/button/Button"));
const Form = dynamic(() => import("@/components/form/Form"));

function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [selectedIllnesses, setSelectedIllnesses] = useState<{ id: string; value: string }[]>([]);
  const [selectedTeeth, setSelectedTeeth] = useState<{ id: string, value: string }[]>([]);
  const [customTreatments, setCustomTreatments] = useState<
    { id: string, value: string, customTreatment: string }[]
  >([]);

  const [sessionDate, setSessionDate] = useState<string>("");
  const [paymentDate, setPaymentDate] = useState<string>("");
  const [nextSessionDate, setNextSessionDate] = useState<string>("");
  const [nextSessionTime, setNextSessionTime] = useState<string>(""); // format: "HH:MM"
  const [images, setImages] = useState<File[]>([]);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    work: "",
    phone: "",
    info: "",
    payment: "",
    treatmentName: "", 
    treatmentCost: "", 
    medicines: "",   
    treatmentCurrency: "SYP", 
     paymentCurrency: "SYP",   
  });

  const illnessesOptions = illnesses.map(option => ({
    ...option,
    selected: option.selected || false  
  }));

const currencyOptions = [
  { value: "SYP", label: "SYP (ليرة سوري)" },
  { value: "USD", label: "USD (دولار)" },
  { value: "EUR", label: "EUR (يورو)" },
];

  let finalNextSessionDate = null;
  if (nextSessionDate && nextSessionTime) {
    const [hours, minutes] = nextSessionTime.split(":").map(Number);
    const dateObj = new Date(nextSessionDate);
    dateObj.setHours(hours);
    dateObj.setMinutes(minutes);
    finalNextSessionDate = dateObj;
  }

  const handleChange = (name: string, value: string) => {
    const convertArabicToEnglishNumbers = (input: string): string => {
      const arabicNumbers: Record<string, string> = {
        '٠': '0',
        '١': '1',
        '٢': '2',
        '٣': '3',
        '٤': '4',
        '٥': '5',
        '٦': '6',
        '٧': '7',
        '٨': '8',
        '٩': '9',
      };
      return input.replace(/[٠-٩]/g, (d) => arabicNumbers[d]);
    };

    const cleanedValue = name === "phone" ? convertArabicToEnglishNumbers(value) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: cleanedValue,
    }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) newErrors.name = "الاسم مطلوب";
    if (!formData.phone.trim()) newErrors.phone = "رقم الهاتف مطلوب";
    if (!formData.age.trim()) newErrors.age = "العمر مطلوب";

    const hasTreatment = formData.treatmentName.trim();
    const hasCost = !!formData.treatmentCost && Number(formData.treatmentCost) > 0;
    const hasTeeth = selectedTeeth.length > 0;

    if (!hasTreatment) newErrors.treatmentName = "اسم العلاج مطلوب";
    if (!hasCost) newErrors.treatmentCost = "تكلفة العلاج مطلوبة ويجب أن تكون رقمًا";
    if (!hasTeeth) newErrors.teeth = "يرجى تحديد السن/الأسنان للعلاج";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
     const treatments = [
  {
    treatmentNames: [{ name: formData.treatmentName.trim() }],
    cost: Number(formData.treatmentCost),
    currency: formData.treatmentCurrency, 
    teeth: selectedTeeth.map(tooth => ({
      id: tooth.id,
      value: tooth.value,
      customTreatment: customTreatments.find(ct => ct.id === tooth.id)?.customTreatment || "",
    })),
    sessions: formData.payment ? [
      {
        sessionDate: sessionDate ? new Date(sessionDate).toISOString() : undefined,
        Payments: formData.payment,
        paymentCurrency: formData.paymentCurrency, 
        PaymentsDate: paymentDate ? new Date(paymentDate).toISOString() : undefined,
      }
    ] : [],
  }
];

      const patientData = {
        name: formData.name.trim(),
        phone: Number(formData.phone),
        age: formData.age.trim(),
        work: formData.work?.trim() || "",
        info: formData.info?.trim() || "",
        illnesses: selectedIllnesses.length
          ? selectedIllnesses.map(({ value }) => ({ illness: value }))
          : [],
        Medicines: formData.medicines
          ? formData.medicines
            .split("-")
            .map(m => m.trim())
            .filter(Boolean)
            .map(medicine => ({ medicine }))
          : [],
        nextSessionDate: nextSessionDate ? new Date(nextSessionDate).toISOString() : null,
        treatments,
      };

     const form = new FormData();
form.append("name", patientData.name);
form.append("phone", patientData.phone.toString());
form.append("age", patientData.age);
form.append("work", patientData.work);
form.append("info", patientData.info);
form.append("nextSessionDate", patientData.nextSessionDate || "");

form.append("treatments", JSON.stringify(patientData.treatments));
form.append("Medicines", JSON.stringify(patientData.Medicines));
form.append("illnesses", JSON.stringify(patientData.illnesses));

images.forEach((file, index) => {
  if (!(file instanceof File)) {
    console.error(`Invalid image at index ${index}`);
  } else {
    form.append("images", file);
  }
});

const response = await fetch("/api/patients", {
  method: "POST",
  body: form,
  credentials: "include",
});

      if (response.ok) {
        const data = await response.json();
        router.push(`/dashboard/profile/${data.data.patientId}`);
      } else {
        console.error("حدث خطأ أثناء الإضافة");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Dashboard- All Patients page
  );
}
export default Page;