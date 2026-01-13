import PropTypes from 'prop-types';
import GenericFilterTable from './ui/GenericFilterTable';

const statusColor = {
    Reject: 'bg-red-100 text-red-800',
    Shortlisted: 'bg-green-100 text-green-800',
    Pending: 'bg-orange-100 text-orange-800',
    Hired: 'bg-blue-100 text-blue-800'
};

const applicantColumns = [
    { key: 'name', label: 'Name' },
    { key: 'employmentType', label: 'Employment Type' },
    { key: 'role', label: 'Role' },
    { key: 'interviewDate', label: 'Interview Date' },
    { key: 'status', label: 'Status', isStatus: true }
];

const ApplicantsTable = ({ applicants = [] }) => {
    return (
        <GenericFilterTable
            title="Applicants List"
            data={applicants}
            columns={applicantColumns}
            filters={['All', 'Shortlisted', 'Reject', 'Hired']}
            statusKey="status"
            statusColorMap={statusColor}
            emptyMessage="No applicants found"
        />
    );
};

ApplicantsTable.propTypes = {
    applicants: PropTypes.arrayOf(
        PropTypes.shape({
            name: PropTypes.string,
            employmentType: PropTypes.string,
            role: PropTypes.string,
            interviewDate: PropTypes.string,
            status: PropTypes.string
        })
    )
};
export default ApplicantsTable;
