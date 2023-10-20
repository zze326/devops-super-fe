import { Model } from "@/api/resource/secret";
type FormDataProps = Partial<Model>;

interface FormProps {
  formData: FormDataProps;
  isEdit: boolean;
}

export type { FormDataProps, FormProps };

export enum Permiss {
  READ = "secret-read",
  ADD = "secret-add",
  UPT = "secret-upt",
  DEL = "secret-del"
}
