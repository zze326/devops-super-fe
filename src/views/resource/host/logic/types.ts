import { Model } from "@/api/resource/host";
import { Model as HostGroupModel } from "@/api/resource/host-group";
type FormDataProps = Partial<Model>;

type ResetPwdFormDataProps = {
  password: string;
  passwordConfirm: string;
};

interface FormProps {
  formData: FormDataProps;
  hostGroupTreeList: HostGroupModel[];
}

export enum Permiss {
  READ = "host-read",
  ADD = "host-add",
  UPT = "host-upt",
  DEL = "host-del",
  TERMINAL_CONNECT = "host-terminal-connect",
  TERMINAL_SFTP_READ = "host-terminal-sftp-read",
  TERMINAL_SFTP_UPLOAD = "host-terminal-sftp-upload",
  TERMINAL_SFTP_DOWNLOAD = "host-terminal-sftp-download",
  TERMINAL_SFTP_DEL = "host-terminal-sftp-del",
  TERMINAL_SESSION_READ = "host-terminal-session-read",
  TERMINAL_SESSION_REPLAY = "host-terminal-session-replay"
}

export type { FormDataProps, ResetPwdFormDataProps, FormProps };
