import LoginExperience from '../../components/LoginExperience';
export default async function Login({searchParams}:{searchParams:Promise<{erro?:string}>}){
 const {erro}=await searchParams;
 return <main className="login-shell"><LoginExperience erro={erro==='1'}/></main>;
}
