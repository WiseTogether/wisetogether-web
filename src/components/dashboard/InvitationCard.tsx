import { IoClose } from "react-icons/io5";
import { PiCopySimpleLight } from "react-icons/pi";
import { showSuccessToast, showErrorToast } from '../../utils/toastNotifications';


interface InvitationCardProps {
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
    invitationLink: string;
}

const InvitationCard: React.FC<InvitationCardProps> = ({ setIsModalOpen, invitationLink }) => {

    // Function to copy the invitation link to clipboard
    const copyToClipboard = () => {
        navigator.clipboard.writeText(invitationLink).then(() => {
            showSuccessToast('Invitation link copied to clipboard!');
        }).catch(() => {
            showErrorToast('Failed to copy invitation link');
        });
    };

    return (
        <div className='fixed inset-0 flex justify-center items-center z-50'>
            <div className='bg-white p-6 rounded-md shadow-lg w-lg'>

                {/* Header with title and close button */}
                <div className='mb-6 w-full flex'>
                    <h2 className='text-emerald-500 text-3xl'>Invitation Link:</h2>
                    <button 
                        className='text-gray-400 text-2xl bg-gray-100 rounded-full h-fit hover:cursor-pointer hover:bg-gray-200 ml-auto'
                        onClick={() => setIsModalOpen(false)}
                    ><IoClose /></button>
                </div>

                {/* Display invitation link and option to copy it */}
                <div className='flex items-center border-solid border-gray-200 border-1 rounded-md inset-shadow-xs w-full' >
                    <p className='text-sm text-gray-500 p-3'>{invitationLink}</p>
                    <button className='border-solid border-gray-200 border-l-1 p-3 ml-auto hover:cursor-pointer'
                        onClick={copyToClipboard}>
                        <PiCopySimpleLight />
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InvitationCard
