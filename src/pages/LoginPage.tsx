import { useState, useRef, useEffect } from 'react';
import SiteLogo from "../assets/images/SiteLogo.svg";
import { useLanguage } from '../Context/LanguageContext';
import InputMask from "react-input-mask";

const BASE_URL = import.meta.env.VITE_API_REQUEST;

// OTP Input component
const OTPInput = ({
  length,
  value,
  onChange,
  onComplete,
}: {
  length: number;
  value: string[];
  onChange: (val: string[]) => void;
  onComplete?: () => void;
}) => {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Fokus keyingiga o'tkazish va auto submit
  useEffect(() => {
    if (value.every(v => v !== '') && value.length === length) {
      onComplete?.();
    }
  }, [value, length, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    const newValue = [...value];
    newValue[idx] = val;
    onChange(newValue);

    if (val && idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
    if (e.key === 'Backspace') {
      if (value[idx] === '' && idx > 0) {
        inputsRef.current[idx - 1]?.focus();
      }
      const newValue = [...value];
      newValue[idx] = '';
      onChange(newValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('Text').replace(/\D/g, '').slice(0, length).split('');
    const newValue = Array(length).fill('');
    pasteData.forEach((v, i) => {
      newValue[i] = v;
    });
    onChange(newValue);
    const firstEmpty = newValue.findIndex(v => v === '');
    if (firstEmpty >= 0) {
      inputsRef.current[firstEmpty]?.focus();
    }
  };

  return (
    <div className="flex gap-2 justify-center mt-4">
      {Array.from({ length }).map((_, idx) => (
        <input
          key={idx}
          ref={el => {
  inputsRef.current[idx] = el; // faqat tayinlash, return yo‘q
}}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[idx] || ''}
          onChange={e => handleChange(e, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          className="w-12 h-12 text-center border rounded-md text-lg"
        />
      ))}
    </div>
  );
};

// Main Login Page
const LoginPage = () => {
  const last_page = localStorage.getItem('last_page') || '/';
  const { translations } = useLanguage();

  const [confirmationCode, setConfirmationCode] = useState(false);
  const [usersPhone, setUsersPhone] = useState<string>(
    () => localStorage.getItem("phone")?.replace(/^998/, '') || ''
  );
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);

  const handlePhoneSubmit = async (phoneNumber: string) => {
    const digitsOnly = phoneNumber.replace(/\D/g, '');
    const fullPhone = `998${digitsOnly}`;

    const regex = /^998\d{9}$/;
    if (!regex.test(fullPhone)) {
      alert("Telefon raqam noto'g'ri. Format: 998XXXXXXXXX");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${BASE_URL}/users/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone_number: fullPhone }),
      });

      if (!res.ok) {
        alert("Telefon raqam yuborilmadi. Iltimos qayta urinib ko'ring.");
        setLoading(false);
        return;
      }

      setUsersPhone(digitsOnly);
      setConfirmationCode(true);
    } catch (error) {
      console.error("Phone submit error:", error);
      alert("Xatolik yuz berdi, qayta urinib ko'ring.");
    } finally {
      setLoading(false);
    }
  };

  const HandleLoginSubmit = async () => {
    if (otp.some(v => v === '')) return;

    const loginData = {
      phone_number: `998${usersPhone}`,
      otp: otp.join('')
    };

    try {
      const res = await fetch(`${BASE_URL}/users/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loginData)
      });

      if (!res.ok) throw new Error(`Login failed: ${res.status}`);

      const dataRes = await res.json();
      const access = dataRes.access_token;
      const refresh = dataRes.refresh_token;

      localStorage.setItem("access_token", access);
      localStorage.setItem("refresh_token", refresh);
      localStorage.setItem("phone", usersPhone);

      setConfirmationCode(false);
      window.location.href = last_page;

    } catch (error) {
      console.error("Login error:", error);
      alert("Login xatolik bilan yakunlandi. Kodni tekshiring.");
    }
  };

  return (
    <div className='w-full h-[100vh] flex items-center justify-center'>
      <div className='w-[400px] p-6 bg-white rounded-lg shadow-md'>
        <img src={SiteLogo} alt="SiteLogo" className='w-[70px] h-[70px] mx-auto mb-4'/>

        {!confirmationCode ? (
          <form onSubmit={(e) => {
            e.preventDefault();
            const phoneInput = (e.target as any).phone.value;
            handlePhoneSubmit(phoneInput);
          }}>
            <div className="flex">
              <span className="px-3 py-2 bg-gray-200 rounded-l-md">+998</span>
              <InputMask
                mask="(99)-999-99-99"
                maskChar={null}
                value={usersPhone}
                onChange={(e: any) => {
                  const val = e.target.value.replace(/\D/g, '');
                  if (val.length <= 9) setUsersPhone(val);
                }}
              >
                {(inputProps: any) => (
                  <input
                    {...inputProps}
                    name="phone"
                    type="text"
                    placeholder="(__)-___-__-__"
                    className="w-full px-3 py-2 border rounded-r-md"
                    required
                  />
                )}
              </InputMask>
            </div>

            <button
              type="submit"
              className={`w-full py-2 mt-4 rounded-md text-white ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={loading}
            >
              {loading ? (
                <div className="flex justify-center items-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
                  </svg>
                  <span>Sending...</span>
                </div>
              ) : (
                translations.saleInfo.verifyCodeButtonText
              )}
            </button>
          </form>
        ) : (
          <>
            <p>{translations.saleInfo.verifySms} <b>+998{usersPhone}</b> {translations.saleInfo.thatNumber}</p>
            <OTPInput length={5} value={otp} onChange={setOtp} onComplete={HandleLoginSubmit} />
            <p className='mt-4'>{translations.saleInfo.verifyCode}</p>
          </>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
