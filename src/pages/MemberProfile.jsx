import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  IdCard,
  Edit2,
  Trash2,
  BookOpen,
  BookMarked,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../services/memberService';
import { loanService } from '../services/loanService';
import MemberModal from '../components/members/MemberModal';
import MemberDeleteModal from '../components/members/MemberDeleteModal';
import IssueModal from '../components/loans/IssueModal';
import ReturnModal from '../components/loans/ReturnModal';

export default function MemberProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [member, setMember] = useState(() => memberService.getMemberById(id));
  const [loading, setLoading] = useState(false);
  const [memberLoans, setMemberLoans] = useState(() => {
    const m = memberService.getMemberById(id);
    return m ? loanService.getActiveLoansByMember(m.id) : [];
  });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [selectedLoanToReturn, setSelectedLoanToReturn] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const loadMember = async () => {
      let found = memberService.getMemberById(id);
      if (!found) {
        setLoading(true);
        await memberService.fetchMembersFromApi(20);
        found = memberService.getMemberById(id);
        setLoading(false);
      }
      setMember(found);
      if (found) {
        setMemberLoans(loanService.getActiveLoansByMember(found.id));
      }
    };
    loadMember();
  }, [id]);

  const refreshMemberData = () => {
    const found = memberService.getMemberById(id);
    setMember(found);
    if (found) {
      setMemberLoans(loanService.getActiveLoansByMember(found.id));
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-24 text-center space-y-4">
        <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
        <p className="text-sm font-semibold text-slate-600">Retrieving member record from registry API...</p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="w-full px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">Member Record Not Found</h2>
        <p className="text-sm text-slate-500 max-w-sm mx-auto">
          The requested member identity or record ID does not exist in the active directory.
        </p>
        <Link
          to="/members"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Members Directory</span>
        </Link>
      </div>
    );
  }

  const isActive = member.status === 'Active';

  // Confirm Delete
  const handleConfirmDelete = () => {
    setIsDeleting(true);
    const res = memberService.deleteMember(member.id);
    setIsDeleting(false);

    if (res.success) {
      toast.success(res.message);
      navigate('/members', { replace: true });
    } else {
      toast.error(res.message || 'Failed to delete member.');
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Navigation & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/members"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Members Directory</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Member</span>
          </button>
        </div>
      </div>

      {/* Main Profile & Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Column: Digital Library Card Visual + Status (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Institutional Library Smartcard */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-white p-6 shadow-xl border border-indigo-900/50">
            {/* Background geometric blur accents */}
            <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-64 h-64 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none"></div>
            <div className="absolute left-0 bottom-0 -translate-x-1/4 translate-y-1/4 w-48 h-48 bg-violet-500/20 rounded-full blur-2xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col justify-between h-full min-h-[220px]">
              
              {/* Card Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                    <BookOpen className="w-4 h-4 text-indigo-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-white">
                      Athenaeum Library
                    </h3>
                    <p className="text-[10px] text-indigo-200/80 font-mono">Reader Identity Card</p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    isActive
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30'
                      : 'bg-rose-500/20 text-rose-300 border-rose-400/30'
                  }`}
                >
                  {member.status}
                </span>
              </div>

              {/* Card Center: Chip & Photo */}
              <div className="my-5 flex items-center justify-between">
                {/* Microchip graphic */}
                <div className="w-11 h-8 rounded-md bg-gradient-to-tr from-amber-300 via-yellow-200 to-amber-400 border border-amber-500/50 shadow-inner flex items-center justify-center">
                  <div className="w-full h-px bg-amber-600/40 my-0.5"></div>
                </div>

                <img
                  src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                  alt={member.name}
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-white/30 shadow-md bg-slate-800"
                  onError={(e) => {
                    e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=Member`;
                  }}
                />
              </div>

              {/* Card Footer: Member ID & Details */}
              <div>
                <p className="text-base sm:text-lg font-extrabold tracking-wide text-white truncate">
                  {member.name}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10 text-xs">
                  <div>
                    <span className="text-[10px] text-indigo-200 uppercase block tracking-wider font-semibold">Card ID</span>
                    <span className="font-mono font-bold text-white tracking-wider">{member.membershipId}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-indigo-200 uppercase block tracking-wider font-semibold">Valid Since</span>
                    <span className="font-mono text-indigo-100">{member.membershipDate}</span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Quick Metrics Card */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Circulation Account Summary
            </h4>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xl font-bold text-slate-900">{member.borrowedCount || 0}</span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Active Loans</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xl font-bold text-emerald-600">
                  {isActive ? 'Eligible' : 'Hold'}
                </span>
                <span className="text-[11px] text-slate-500 block mt-0.5">Borrowing Status</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsIssueModalOpen(true)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-xs transition-all cursor-pointer"
              >
                <BookMarked className="w-3.5 h-3.5" />
                <span>Issue Book</span>
              </button>
              <Link
                to="/books"
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Catalog</span>
              </Link>
            </div>
          </div>

        </div>

        {/* Right Column: Complete Member Information & Profile Details (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Member Overview Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/80 shadow-2xs space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                    {member.role}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {member.membershipId}
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {member.name}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Institutional record enrolled on {member.membershipDate}
                </p>
              </div>

              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border self-start sm:self-center ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-rose-50 text-rose-700 border-rose-200'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                {member.status} Account
              </span>
            </div>

            {/* Member Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Field 1: Full Name */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  Full Name
                </span>
                <p className="text-sm font-bold text-slate-900">{member.name}</p>
              </div>

              {/* Field 2: Membership ID */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block flex items-center gap-1">
                  <IdCard className="w-3.5 h-3.5 text-indigo-500" />
                  Membership ID
                </span>
                <p className="text-sm font-mono font-bold text-indigo-600">{member.membershipId}</p>
              </div>

              {/* Field 3: Email Address */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  Email Address
                </span>
                <a
                  href={`mailto:${member.email}`}
                  className="text-sm font-bold text-slate-900 hover:text-indigo-600 truncate block transition-colors"
                  title={member.email}
                >
                  {member.email}
                </a>
              </div>

              {/* Field 4: Mobile Number */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  Mobile Number
                </span>
                <p className="text-sm font-mono font-bold text-slate-900">{member.phone}</p>
              </div>

              {/* Field 5: Membership Date */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  Membership Enrollment Date
                </span>
                <p className="text-sm font-mono font-bold text-slate-900">
                  {new Date(member.membershipDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>

              {/* Field 6: Address */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 sm:col-span-2">
                <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold block flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                  Residential / Campus Address
                </span>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed">
                  {member.address}
                </p>
              </div>

            </div>

            {/* Circulation Privileges Notice */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-1.5 text-xs">
              <div className="flex items-center gap-2 font-bold text-indigo-950">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Borrowing Privileges & Quota</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                As a registered {member.role}, this reader is authorized to check out up to 5 monographs concurrently for 14-day borrowing periods with online renewal options.
              </p>
            </div>

            {/* Active Book Loans for this Member */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <BookMarked className="w-4 h-4 text-blue-600" />
                  Active Book Loans ({memberLoans.length})
                </h3>
                <Link
                  to="/circulation"
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline font-semibold"
                >
                  Circulation Desk →
                </Link>
              </div>

              {memberLoans.length > 0 ? (
                <div className="space-y-2">
                  {memberLoans.map((loan) => (
                    <div
                      key={loan.id}
                      className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={loan.bookCover}
                          alt={loan.bookTitle}
                          className="w-10 h-14 object-cover rounded-md border border-slate-200 shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100';
                          }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{loan.bookTitle}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{loan.bookAuthor}</p>
                          <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                            Due: <strong className={loan.status === 'Overdue' ? 'text-rose-600' : 'text-slate-700'}>{loan.dueDate}</strong>
                            {loan.status === 'Overdue' && (
                              <span className="text-rose-600 font-bold ml-1.5">• Fine: ₹{loan.fineAmount}</span>
                            )}
                            {' '}• Ref: {loan.id}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            loan.status === 'Overdue'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}
                        >
                          {loan.status}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedLoanToReturn(loan);
                            setIsReturnModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer"
                        >
                          Return
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No active monographs currently on loan to this reader.</p>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Edit Modal */}
      <MemberModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => {
          setMember(updated);
          refreshMemberData();
        }}
        initialMember={member}
        mode="edit"
      />

      {/* Delete Confirmation Modal */}
      <MemberDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        memberName={member.name}
        membershipId={member.membershipId}
        isDeleting={isDeleting}
      />

      {/* Issue Modal for this Member */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        preselectedMemberId={member.id}
        onSuccess={refreshMemberData}
      />

      {/* Return Modal for Member's Loan */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedLoanToReturn(null);
        }}
        loan={selectedLoanToReturn}
        onSuccess={refreshMemberData}
      />

    </div>
  );
}
