import { Model } from "@/api/ci/ci-pipeline";
import { Model as KubernetesConfig } from "@/api/resource/kubernetes-config";
type FormDataProps = Partial<Model>;

interface FormProps {
  formData: FormDataProps;
  kubernetesConfigs: KubernetesConfig[];
}

export type { FormDataProps, FormProps };

export enum Permiss {
  READ = "ci-pipeline-read",
  ADD = "ci-pipeline-add",
  UPT = "ci-pipeline-upt",
  DEL = "ci-pipeline-del",
  ARRANGE = "ci-pipeline-arrange"
}
