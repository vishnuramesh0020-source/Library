import { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlus,
  Search,
  RotateCcw,
  LayoutGrid,
  List,
  Eye,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserX,
  Phone,
  Mail,
  MapPin,
  Calendar,
  IdCard
} from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../services/memberService';
import MemberCard from '../components/members/MemberCard';
import MemberModal from '../components/members/MemberModal';
import MemberDeleteModal from '../components/members/MemberDeleteModal';

export default function MemberList() {
  const [members, setMembers] = useState(() => memberService.getAllMembers());

  // Search & Filter & Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name_asc');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' | 'edit'
  const [selectedMember, setSelectedMember] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter & Sort logic
  const filteredMembers = useMemo(() => {
    return members
      .filter((member) => {
        // Search term matching
        const term = searchTerm.toLowerCase().trim();
        const matchSearch =
          !term ||
          member.name.toLowerCase().includes(term) ||
          member.email.toLowerCase().includes(term) ||
          member.phone.toLowerCase().includes(term) ||
          member.membershipId.toLowerCase().includes(term) ||
          (member.address && member.address.toLowerCase().includes(term));

        // Status filter
        const matchStatus = statusFilter === 'All' || member.status === statusFilter;

        return matchSearch && matchStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'name_desc') {
          return b.name.localeCompare(a.name);
        }
        if (sortBy === 'date_desc') {
          return new Date(b.membershipDate) - new Date(a.membershipDate);
        }
        if (sortBy === 'date_asc') {
          return new Date(a.membershipDate) - new Date(b.membershipDate);
        }
        return 0;
      });
  }, [members, searchTerm, statusFilter, sortBy]);

  // Reset to page 1 when search or filter parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Paginated slice
  const totalPages = Math.ceil(filteredMembers.length / pageSize) || 1;
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredMembers.slice(start, start + pageSize);
  }, [filteredMembers, currentPage, pageSize]);

  // Open Add Modal
  const handleOpenAdd = () => {
    setSelectedMember(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEdit = (member) => {
    setSelectedMember(member);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  // Success handler for Add/Edit
  const handleModalSuccess = () => {
    setMembers(memberService.getAllMembers());
  };

  // Open Delete Modal
  const handleOpenDelete = (member) => {
    setMemberToDelete(member);
    setIsDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = () => {
    if (!memberToDelete) return;
    setIsDeleting(true);
    const res = memberService.deleteMember(memberToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      toast.success(res.message);
      setMembers(memberService.getAllMembers());
      setIsDeleteModalOpen(false);
      setMemberToDelete(null);
    } else {
      toast.error(res.message || 'Failed to delete member.');
    }
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('All');
    setSortBy('name_asc');
    setCurrentPage(1);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Enrolled Directory: {members.length} members
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Member Management & Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage student & faculty readers, identity cards, contact records, and borrowing credentials.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add New Member</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (6 cols) */}
          <div className="lg:col-span-6 relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by full name, email, mobile phone, or membership ID..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter (3 cols) */}
          <div className="lg:col-span-3">
            <div className="relative rounded-xl">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                <option value="All">All Statuses (Active & Suspended)</option>
                <option value="Active">🟢 Active Members</option>
                <option value="Suspended">🔴 Suspended Members</option>
              </select>
            </div>
          </div>

          {/* Sort Option (3 cols) */}
          <div className="lg:col-span-3">
            <div className="relative rounded-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                <option value="name_asc">🔤 Name (A to Z)</option>
                <option value="name_desc">🔤 Name (Z to A)</option>
                <option value="date_desc">📅 Newest Enrolled</option>
                <option value="date_asc">📅 Oldest Enrolled</option>
              </select>
            </div>
          </div>

        </div>

        {/* Toolbar Footer: Matches count & View mode switch */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Showing <strong className="text-slate-800">{filteredMembers.length}</strong> matching members</span>
            {(searchTerm || statusFilter !== 'All' || sortBy !== 'name_asc') && (
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer ml-1"
              >
                <RotateCcw className="w-3 h-3" />
                Reset filters
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-lg">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white shadow-2xs text-indigo-600' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Members Content: Empty State vs Table vs Grid */}
      {filteredMembers.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-2xl border border-slate-200/80 p-8 space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
            <UserX className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No members found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No member matched your search keywords or filter criteria. Try adjusting terms or resetting filters.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedMembers.map((member) => (
            <MemberCard
              key={member.id}
              member={member}
              onEdit={handleOpenEdit}
              onDelete={handleOpenDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">Membership ID</th>
                  <th className="py-3 px-4">Contact Info</th>
                  <th className="py-3 px-4">Address</th>
                  <th className="py-3 px-4">Membership Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedMembers.map((member) => {
                  const isActive = member.status === 'Active';
                  return (
                    <tr key={member.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={member.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.name)}`}
                            alt={member.name}
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=Member`;
                            }}
                          />
                          <div>
                            <Link
                              to={`/members/${member.id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 transition-colors text-xs sm:text-sm line-clamp-1"
                            >
                              {member.name}
                            </Link>
                            <p className="text-[11px] text-slate-400 font-medium">{member.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Membership ID */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="inline-flex items-center gap-1 font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          <IdCard className="w-3 h-3 text-indigo-500" />
                          {member.membershipId}
                        </span>
                      </td>

                      {/* Contact Info (Email & Mobile) */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-slate-700 truncate max-w-[200px]" title={member.email}>
                            <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-500">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{member.phone}</span>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4 max-w-[220px]">
                        <div className="flex items-start gap-1 text-slate-600 text-xs truncate" title={member.address}>
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" />
                          <span className="truncate">{member.address}</span>
                        </div>
                      </td>

                      {/* Membership Date */}
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{member.membershipDate}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isActive
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          {member.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <Link
                            to={`/members/${member.id}`}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Member Profile"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEdit(member)}
                            className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Edit Member"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(member)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Member"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Footer */}
      {filteredMembers.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
          
          {/* Page Size & Range Summary */}
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredMembers.length)}</strong> to{' '}
              <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredMembers.length)}</strong> of{' '}
              <strong className="text-slate-800">{filteredMembers.length}</strong> members
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 outline-hidden font-semibold cursor-pointer"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Page Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-indigo-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Unified Add / Edit Member Modal */}
      <MemberModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleModalSuccess}
        initialMember={selectedMember}
        mode={modalMode}
      />

      {/* Member Deletion Confirmation Modal */}
      <MemberDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setMemberToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        memberName={memberToDelete?.name}
        membershipId={memberToDelete?.membershipId}
        isDeleting={isDeleting}
      />

    </div>
  );
}
