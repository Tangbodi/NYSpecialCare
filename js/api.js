import axios from 'axios';

export const sendEmail = async (formData) => {
    try {
        const response = await axios.post('/api/send-email', formData);
        return {
            success: true,
            message: response.data.message || 'Email sent successfully!',
        };
    } catch (error) {
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send email.',
        };
    }
};

